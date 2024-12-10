// SemesterPlanner.js
// Generates semester schedules based on student personalizations.
// Allows student to download their semester plan.

import React, { useState } from "react";
import axios from "axios";
import { parse } from "papaparse";
import { jsPDF } from "jspdf"; // Library to generate PDF documents
import "jspdf-autotable"; // Plugin for formatting tables in PDFs
import "./SemesterPlanner.css"; // Custom CSS file for styling

function SemesterPlanner() {
  // Retrieve OpenAI API key from environment variables
  const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;

  // State variables for the component
  const [school, setSchool] = useState(""); // Selected school
  const [major, setMajor] = useState(""); // Selected major
  const [courses, setCourses] = useState([]); // Array to store courses fetched from CSV
  const [responses, setResponses] = useState([]); // Array to store user's credit received status for each course
  const [loading, setLoading] = useState(false); // Loading state for async operations
  const [semesterPlan, setSemesterPlan] = useState([]); // Stores the parsed semester plan data
  const [messages, setMessages] = useState([]); // Array to store messages exchanged with the AI
  const [isSubmitted, setIsSubmitted] = useState(false); // Flag to indicate whether the form has been submitted
  const [personalizations, setPersonalizations] = useState(""); // User's personalized constraints for the schedule

  // Check if the API key is missing, log an error if true
  if (!openaiApiKey) {
    console.error("API Key is missing! Please ensure it's in your .env file.");
  }

  // Function to fetch courses from a CSV file based on the selected school and major
  const fetchCourses = async () => {
    if (!school || !major) {
      alert("Please select a school and major first."); // Alert if school or major are not selected
      return;
    }

    try {
      setLoading(true); // Start loading state
      const filePath = `/data/${school}_${major}.csv`; // Construct file path based on school and major
      console.log("Fetching file from:", filePath); // Log file path for debugging

      // Fetch the CSV data using axios
      const response = await axios.get(filePath);
      const parsedCourses = parseCSV(response.data); // Parse the CSV data
      setCourses(parsedCourses); // Set the courses state
      setResponses(new Array(parsedCourses.length).fill({ creditReceived: "No" })); // Initialize responses with default value
    } catch (error) {
      console.error("Error fetching courses:", error); // Log errors for debugging
      alert("Unable to load course data. Please check your selection and try again."); // Alert user if there's an error
    } finally {
      setLoading(false); // End loading state
    }
  };

// Function to parse CSV data using the 'papaparse' library
const parseCSV = (csvData) => {
  const parsed = parse(csvData, {
    header: true, // Use the first row as header
    skipEmptyLines: true, // Skip any empty lines
    dynamicTyping: true, // Automatically convert data types (e.g., string to number)
  });

  if (parsed.errors.length > 0) {
    console.error("CSV parsing errors:", parsed.errors); // Log CSV parsing errors for debugging
  }

  // Map CSV rows into a structured array of course objects
  return parsed.data.map((row) => ({
    courseName: row["CourseName"] || "Unknown Course", // Default value if column is missing
    courseNumber: row["CourseNumber"] || "N/A", // Default value if column is missing
    credits: row["Credits"] || 0, // Default value if column is missing
    prerequisite: row["Prerequisite"] || "None", // Default value if column is missing
  }));
};

// Function to handle changes in the "Credit Received?" dropdown
const handleCreditReceivedChange = (index, value) => {
  const newResponses = [...responses]; // Copy current responses array
  newResponses[index] = { ...newResponses[index], creditReceived: value }; // Update the specific response
  setResponses(newResponses); // Set the updated responses state
};

// Function to handle form submission and communication with OpenAI API
  const handleSubmit = async () => {
    console.log("Courses loaded:", courses);
    console.log("Is submitted:", isSubmitted);

    if (courses.length === 0 || isSubmitted) {
      alert("Please ensure courses are loaded."); // Alert if no courses are loaded or already submitted
      return;
    }

    setLoading(true); // Set loading state before processing

    // Prompt and constraints to GPT-4o
    const userMessage = `Please generate a semester planner in CSV format. 
    Each semester should be a separate CSV block with the columns:
    Course Name, Course Number, Credit Hours, Total Credits Per Semester.
    Do not include quotation marks around the course data. MUST have at least one class. 
    Each semester can only have AT MOST 18 CREDITS total. DO NOT MAKE UP ANY CLASSES.
    ONLY USE THE CLASSES GIVEN. DO NOT MAKE UP ANY. All classes must be used. Do not put a class that was already taken.
    Only include one header (Course Name, Course Number, Credit Hours, Total Credits Per Semester) 
    at the top, followed by the course details for each semester.
    Each semester should include the total credits per semester (sum of credits for each course).
    DO NOT SAY OR DO ANYTHING ELSE. If they took the course already, do not include it.
    Do not include any text or extra lines above the tables, just the clean CSV data.
    MAKE SURE THE CSVs ARE SEPARATED FOR EACH SEMESTER. DO NOT REPEAT ANY CLASSES.
    LOOK AT THE PREREQUISITE. ENSURE THAT THE PREREQUESITE IS IN THE SEMESTER BEFORE IT.
    A PREQUESITE MUST BE TAKEN BEFORE THE CLASS ITSELF.

    THE STUDENT ALSO REQUESTS THE FOLLOWING, MUST FOLLOW THESE
    CONSTRAINTS EXACTLY!!!: ${personalizations}
    Here are the courses for: ${courses.map((course, index) =>
      `${course.courseName} (${course.courseNumber}): ${course.credits} credits, 
      Credit received: ${responses[index].creditReceived}`
    ).join("; ")}`;

    const newMessages = [{ sender: "student", text: userMessage }];
    setMessages(newMessages);
    
    try {
      // Send a request to the OpenAI API to generate a semester planner based on user input
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o", // Specify the GPT model to use
          messages: [{ role: "user", content: userMessage }], // The input message to the model
          max_tokens: 4000, // Maximum number of tokens for the response
        },
        {
          headers: {
            Authorization: `Bearer ${openaiApiKey}`, // Include the API key for authorization
            "Content-Type": "application/json", // Content type for the request
          },
          timeout: 30000, // Set a timeout for the request
        }
      );

    // Process the response from the OpenAI API
    const chatGptResponse = {
      sender: "planner",
      text: response.data.choices[0].message.content.trim(), // Get the content of the AI response
    };

    setMessages((prevMessages) => [...prevMessages, chatGptResponse]); // Add the response to the messages state
    setSemesterPlan(chatGptResponse.text); // Set the semester plan based on the response

    parseAndDisplayCSV(chatGptResponse.text); // Call function to parse and display the CSV data

    setCourses([]); // Clear the courses state after submission
    setResponses([]); // Clear the responses state after submission
    setIsSubmitted(true); // Set the submitted flag to true
  } catch (error) {
    console.error("Error communicating with OpenAI API:", error); // Log any errors for debugging
    alert("There was an error processing your request. Please try again."); // Alert user if there is an error
  } finally {
    setLoading(false); // End loading state
  }
};

  // Function to parse the CSV text and display the data in a structured format
  const parseAndDisplayCSV = (csvText) => {
    const semesterTables = csvText.split("\n\n").map((semesterText) => {
      const lines = semesterText.split("\n").filter((line) => {
        return line.trim() !== "" && !line.startsWith("Course Name");
      });

      const rows = lines.map((line) => {
        const [courseName, courseNumber, credits] = line.split(",").map((item) => item.trim());
        return { courseName, courseNumber, credits: parseInt(credits) }; // Parse course data
      }).filter(row => !isNaN(row.credits)); // Filter out rows with NaN credits

      // Calculate total credits for the semester and add it as a row
      const totalCredits = rows.reduce((sum, course) => sum + (course.credits || 0), 0);
      rows.push({
        courseName: "Total Credits",
        courseNumber: "",
        credits: totalCredits,
      });

      return { rows }; // Return the semester data object
    });

    console.log("Parsed Semester Tables:", semesterTables); // Log parsed data for debugging
    setSemesterPlan(semesterTables); // Update the semesterPlan state with parsed data
  };

  // Function to handle PDF generation and download
  const handlePrintSchedule = () => {
    const doc = new jsPDF();
  
    // Start with the first semester
    const tableData = semesterPlan.map((semester) => {
      return semester.rows.map((course) => [
        course.courseName,
        course.courseNumber,
        course.credits,
      ]);
    });
  
    // Generate the table for each semester
    tableData.forEach((semesterRows, idx) => {
      if (idx > 0) {
        doc.addPage(); // Add a new page for subsequent semesters
      }
  
      // Set up the autoTable options
      doc.autoTable({
        head: [['Course Name', 'Course Number', 'Credits']], // Column headers
        body: semesterRows, // Rows for the current semester
        startY: 20, // Start the table 20mm from the top
        margin: { top: 20, left: 10, right: 10, bottom: 10 }, // Direct margin configuration
        tableWidth: 'auto', // Let the table width adjust automatically
        theme: 'striped', // Optional: makes it visually more appealing
        pageBreak: 'auto', // Allow the table to break into multiple pages if needed
        columnStyles: {
          0: { cellWidth: 'auto' }, // Adjust column 1 (Course Name) width
          1: { cellWidth: 'auto' }, // Adjust column 2 (Course Number) width
          2: { cellWidth: 'auto' }, // Adjust column 3 (Credits) width
        },
        bodyStyles: { lineWidth: 0.1, lineColor: [0, 0, 0] }, // Adjust line styles
      });
    });
  
    // Save the PDF
    doc.save('semester_plan.pdf');
  };
  
  

  return (
    <div className="semester-planner-body">
      <div className="semester-planner">
        {!isSubmitted && (
          <>
            <div className="dropdown-container">
              <label>School:</label>
              <select onChange={(e) => setSchool(e.target.value)} value={school}>
                <option value="">Select School</option>
                <option value="TAMU-CC">TAMU-CC</option>
                <option value="TexasState">Texas State</option>
                <option value="UT">UT</option>
              </select>
              <label>Major:</label>
              <select onChange={(e) => setMajor(e.target.value)} value={major}>
                <option value="">Select Major</option>
                <option value="ComputerScience">Computer Science</option>
                <option value="Psychology">Psychology</option>
                <option value="Biology">Biology</option>
              </select>
            </div>
            <button onClick={fetchCourses} disabled={loading || !school || !major}>
              View Courses
            </button>
          </>
        )}

        {courses.length > 0 && !isSubmitted && (
          <>
            <div className="personalization-container">
              <label>Personalizations:</label>
              <textarea
                value={personalizations}
                onChange={(e) => setPersonalizations(e.target.value)}
                placeholder="Add any personal preferences for the schedule here..."
              />
            </div>
            <div className="courses-table-container">
              <table className="courses-table">
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Credit Received?</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => (
                    <tr key={index}>
                      <td>{course.courseName}</td>
                      <td>{course.credits}</td>
                      <td>
                        <select
                          value={responses[index].creditReceived}
                          onChange={(e) => handleCreditReceivedChange(index, e.target.value)}
                        >
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {courses.length > 0 && !isSubmitted && (
          <button onClick={handleSubmit} disabled={loading}>
            Get your personalized schedule
          </button>
        )}

        {semesterPlan.length > 0 && (
          <div className="semester-tables">
            {semesterPlan.map((semester, idx) => (
              <div key={idx} className="semester-table">
                <h2>Semester {idx + 1}</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Course Number</th>
                      <th>Credits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {semester.rows.map((course, index) => (
                      <tr key={index}>
                        <td>{course.courseName}</td>
                        <td>{course.courseNumber}</td>
                        <td>{course.credits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            <button onClick={handlePrintSchedule} className="print-button">
              Print Schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SemesterPlanner;
