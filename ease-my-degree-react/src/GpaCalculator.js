// GpaCalculator.js
// This calculates the student's GPA based on their inputs.
// GPT-4o generates suggested grades to reach desired GPA

// Import necessary modules and libraries
import React, { useState, useEffect } from "react"; // React and hooks for state and lifecycle management
import axios from "axios"; // Library for making HTTP requests
import { parse } from "papaparse"; // Library for parsing CSV data
import "./GpaCalculator.css"; // CSS for styling the GPA Calculator component

// Define the GpaCalculator component
function GpaCalculator() {
  const [school, setSchool] = useState(""); // State for storing selected school
  const [major, setMajor] = useState(""); // State for storing selected major
  const [courses, setCourses] = useState([]); // State for storing course data
  const [loading, setLoading] = useState(false); // State to show loading status
  const [gpa, setGpa] = useState(null); // State for storing calculated GPA
  const [desiredGPA, setDesiredGPA] = useState(""); // State for storing desired GPA input
  const [recommendedGrades, setRecommendedGrades] = useState(null); // State for recommended grades output
  const [gptSuggestions, setGptSuggestions] = useState(null); // State for GPT-4 suggestions

  // Function to fetch course data based on school and major
  const fetchCourses = async () => {
    if (!school || !major) {
      alert("Please select a school and major first.");
      return;
    }

    try {
      setLoading(true);
      const filePath = `/data/${school}_${major}.csv`; // Construct the file path for CSV
      const response = await axios.get(filePath); // Fetch CSV data from the server
      const parsedCourses = parseCSV(response.data); // Parse CSV data
      setCourses(parsedCourses); // Set courses state with parsed data
    } catch (error) {
      console.error("Error fetching courses:", error);
      alert("Unable to load course data. Please check your selection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to parse CSV data into a structured format
  const parseCSV = (csvData) => {
    const parsed = parse(csvData, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    return parsed.data.map((row) => ({
      courseName: row.CourseName || "Unknown Course",
      credits: row.Credits || 0,
      grade: "N/A",
    }));
  };

  // Function to calculate the current GPA based on course data and grades
  const calculateGPA = () => {
    const gradePoints = {
      A: 4.0,
      B: 3.0,
      C: 2.0,
      D: 1.0,
      F: 0.0,
    };

    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach((course) => {
      if (gradePoints[course.grade] !== undefined) {
        totalPoints += gradePoints[course.grade] * course.credits;
        totalCredits += course.credits;
      }
    });

    // If no credits taken to calculate GPA
    if (totalCredits === 0) {
      alert("No valid grades entered to calculate GPA.");
      return;
    }

    setGpa((totalPoints / totalCredits).toFixed(2));
  };

  // Function to calculate recommended grades to reach the desired GPA
  const calculateRecommendedGrades = () => {
    if (!desiredGPA || isNaN(desiredGPA) || desiredGPA < 0 || desiredGPA > 4) {
      alert("Please enter a valid desired GPA between 0 and 4.");
      return;
    }

    const gradePoints = {
      A: 4.0,
      B: 3.0,
      C: 2.0,
      D: 1.0,
      F: 0.0,
    };

    let currentPoints = 0;
    let currentCredits = 0;

    courses.forEach((course) => {
      if (gradePoints[course.grade] !== undefined) {
        currentPoints += gradePoints[course.grade] * course.credits;
        currentCredits += course.credits;
      }
    });

    const currentGPA = currentCredits === 0 ? 0 : (currentPoints / currentCredits).toFixed(2);
    const requiredTotalPoints = desiredGPA * (currentCredits + getRemainingCredits());
    let pointsNeeded = requiredTotalPoints - currentPoints;

    if (pointsNeeded <= 0) {
      setRecommendedGrades("You already have the GPA or higher.");
      return;
    }

    let remainingCourses = courses.filter(course => course.grade === "N/A");
    let requiredGrades = [];

    for (let i = 0; i < remainingCourses.length; i++) {
      let course = remainingCourses[i];
      let credits = course.credits;
      let gradeNeeded = Math.ceil(pointsNeeded / credits);
      gradeNeeded = Math.min(gradeNeeded, 4); // Ensure the grade doesn't exceed an 'A'

      let gradeLetter = Object.keys(gradePoints).find(key => gradePoints[key] === gradeNeeded);
      requiredGrades.push({
        courseName: course.courseName,
        requiredGrade: gradeLetter,
      });

      pointsNeeded -= gradeNeeded * credits;
      if (pointsNeeded <= 0) break;
    }

    setRecommendedGrades(requiredGrades);

    // Call GPT-4o for additional suggestions based on current data
    fetchGPTSuggestions(currentGPA, currentCredits, requiredGrades);
  };

  // Function to get the total credits of remaining courses that haven't been graded
  const getRemainingCredits = () => {
    return courses.filter(course => course.grade === "N/A")
                  .reduce((total, course) => total + course.credits, 0);
  };

  // Function to fetch GPT-4o suggestions for courses
  const fetchGPTSuggestions = async (currentGPA, currentCredits, requiredGrades) => {
    const openAIAPIKey = "YOUR_OPENAI_API_KEY";

    const prompt = `
    I am trying to calculate the grades I need to achieve a desired GPA. Here is the data:
    
    - Current GPA: ${currentGPA}
    - Total credits completed so far: ${currentCredits}
    - Desired GPA: ${desiredGPA}
    - Remaining courses (credits and grades needed):
        ${courses.filter(course => course.grade === "N/A").map(course => `    - ${course.courseName}, Credits: ${course.credits}`).join("\n")}
    
    Please suggest the grades needed for each remaining course to achieve the desired GPA. Ensure that the grade letter corresponds to the necessary GPA points: A = 4.0, B = 3.0, C = 2.0, D = 1.0, F = 0.0.
  `;

    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          // Calling GPT-4o model to handle request
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a helpful academic advisor.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        {
          headers: {
            "Authorization": `Bearer ${openAIAPIKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const gptResponse = response.data.choices[0].message.content;
      setGptSuggestions(gptResponse);
    } catch (error) {
      console.error("Error fetching GPT suggestions:", error);
    }
  };

  // Recalculate recommended grades whenever desiredGPA or courses change
  useEffect(() => {
    if (desiredGPA !== "") {
      calculateRecommendedGrades();
    }
  }, [desiredGPA, courses]);

  // Handle grade change in the course table
  const handleGradeChange = (index, value) => {
    const updatedCourses = [...courses];
    updatedCourses[index].grade = value;
    setCourses(updatedCourses);
  };

  return (
    <div className="gpa-calculator-body">
      <div className="gpa-calculator">
        <h1>GPA Calculator</h1>

        {/* Dropdown for selecting school */}
        <div className="dropdown-container">
          <label>School:</label>
          <select onChange={(e) => setSchool(e.target.value)} value={school}>
            <option value="">Select School</option>
            <option value="TAMU-CC">TAMU-CC</option>
            <option value="TexasState">Texas State</option>
            <option value="UT">UT</option>
          </select>

          {/* Dropdown for selecting major */}
          <label>Major:</label>
          <select onChange={(e) => setMajor(e.target.value)} value={major}>
            <option value="">Select Major</option>
            <option value="ComputerScience">Computer Science</option>
            <option value="Psychology">Psychology</option>
            <option value="Biology">Biology</option>
          </select>
        </div>

        {/* Button to load courses */}
        <button onClick={fetchCourses} disabled={loading || !school || !major}>
          {loading ? "Loading..." : "Load Courses"}
        </button>

        {/* Display the table of courses */}
        {courses.length > 0 && (
          <div className="courses-table-container">
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Credits</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr key={index}>
                    <td>{course.courseName}</td>
                    <td>{course.credits}</td>
                    <td>
                      <select value={course.grade} onChange={(e) => handleGradeChange(index, e.target.value)}>
                        <option value="N/A">N/A</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="F">F</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Input field for desired GPA */}
        <div className="desired-gpa-container">
          <label>Desired GPA:</label>
          <input
            type="number"
            min="0"
            max="4"
            step="0.1"
            value={desiredGPA}
            onChange={(e) => setDesiredGPA(e.target.value)}
            placeholder="Enter desired GPA"
          />
        </div>

        {/* Button to calculate current GPA */}
        <button onClick={calculateGPA} disabled={loading}>
          Calculate Current GPA
        </button>

        {/* Display current GPA */}
        {gpa && (
          <div className="gpa-display">
            <h2>Current GPA: {gpa}</h2>
          </div>
        )}

        {/* Display recommended grades */}
        {recommendedGrades && (
          <div className="recommended-grades-container">
            <h2>Recommended Grades to Achieve Desired GPA</h2>
            <ul>
              {recommendedGrades.map((grade, index) => (
                <li key={index}>{grade.courseName}: {grade.requiredGrade}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Display GPT-4 suggestions */}
        {gptSuggestions && (
          <div className="gpt-suggestions">
            <h2>GPT-4 Suggestions:</h2>
            <p>{gptSuggestions}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default GpaCalculator;
