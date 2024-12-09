import React, { useState } from "react";
import axios from "axios";
import { parse } from "papaparse";
import { jsPDF } from "jspdf"; // Added for PDF generation
import "jspdf-autotable"; // Added for table formatting in PDFs
import "./SemesterPlanner.css";

function SemesterPlanner() {
  const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [courses, setCourses] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [semesterPlan, setSemesterPlan] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [personalizations, setPersonalizations] = useState("");

  if (!openaiApiKey) {
    console.error("API Key is missing! Please ensure it's in your .env file.");
  }

  const fetchCourses = async () => {
    if (!school || !major) {
      alert("Please select a school and major first.");
      return;
    }

    try {
      setLoading(true);
      const filePath = `/data/${school}_${major}.csv`;
      console.log("Fetching file from:", filePath);

      const response = await axios.get(filePath);
      const parsedCourses = parseCSV(response.data);
      setCourses(parsedCourses);
      setResponses(new Array(parsedCourses.length).fill({ creditReceived: "No" }));
    } catch (error) {
      console.error("Error fetching courses:", error);
      alert("Unable to load course data. Please check your selection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (csvData) => {
    const parsed = parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsed.errors.length > 0) {
      console.error("CSV parsing errors:", parsed.errors);
    }

    return parsed.data.map((row) => ({
      courseName: row["CourseName"] || "Unknown Course",
      courseNumber: row["CourseNumber"] || "N/A",
      credits: row["Credits"] || 0,
      prerequisite: row["Prerequisite"] || "None",
    }));
  };

  const handleCreditReceivedChange = (index, value) => {
    const newResponses = [...responses];
    newResponses[index] = { ...newResponses[index], creditReceived: value };
    setResponses(newResponses);
  };

  const handleSubmit = async () => {
    console.log("Courses loaded:", courses);
    console.log("Is submitted:", isSubmitted);

    if (courses.length === 0 || isSubmitted) {
      alert("Please ensure courses are loaded.");
      return;
    }

    setLoading(true);

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
    CONSTRAINTS!!!: ${personalizations}
    Here are the courses for: ${courses.map((course, index) =>
      `${course.courseName} (${course.courseNumber}): ${course.credits} credits, 
      Credit received: ${responses[index].creditReceived}`
    ).join("; ")}`;

    const newMessages = [{ sender: "student", text: userMessage }];
    setMessages(newMessages);

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: [{ role: "user", content: userMessage }],
          max_tokens: 4000,
        },
        {
          headers: {
            Authorization: `Bearer ${openaiApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      const chatGptResponse = {
        sender: "planner",
        text: response.data.choices[0].message.content.trim(),
      };

      setMessages((prevMessages) => [...prevMessages, chatGptResponse]);
      setSemesterPlan(chatGptResponse.text);

      parseAndDisplayCSV(chatGptResponse.text);

      setCourses([]);
      setResponses([]);
      setIsSubmitted(true); // After submission, hide dropdowns and button
    } catch (error) {
      console.error("Error communicating with OpenAI API:", error);
      alert("There was an error processing your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const parseAndDisplayCSV = (csvText) => {
    const semesterTables = csvText.split("\n\n").map((semesterText) => {
      const lines = semesterText.split("\n").filter((line) => {
        return line.trim() !== "" && !line.startsWith("Course Name");
      });

      const rows = lines.map((line) => {
        const [courseName, courseNumber, credits] = line.split(",").map((item) => item.trim());
        return { courseName, courseNumber, credits: parseInt(credits) };
      }).filter(row => !isNaN(row.credits));

      const totalCredits = rows.reduce((sum, course) => sum + (course.credits || 0), 0);
      rows.push({
        courseName: "Total Credits",
        courseNumber: "",
        credits: totalCredits
      });

      return { rows };
    });

    setSemesterPlan(semesterTables);
  };

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
