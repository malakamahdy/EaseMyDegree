import React, { useState, useEffect } from "react";
import axios from "axios";
import { parse } from "papaparse";
import "./GpaCalculator.css";

function GpaCalculator() {
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gpa, setGpa] = useState(null);
  const [desiredGPA, setDesiredGPA] = useState("");
  const [recommendedGrades, setRecommendedGrades] = useState(null);
  const [gptSuggestions, setGptSuggestions] = useState(null);

  const fetchCourses = async () => {
    if (!school || !major) {
      alert("Please select a school and major first.");
      return;
    }

    try {
      setLoading(true);
      const filePath = `/data/${school}_${major}.csv`;
      const response = await axios.get(filePath);
      const parsedCourses = parseCSV(response.data);
      setCourses(parsedCourses);
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

    return parsed.data.map((row) => ({
      courseName: row.CourseName || "Unknown Course",
      credits: row.Credits || 0,
      grade: "N/A",
    }));
  };

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

    if (totalCredits === 0) {
      alert("No valid grades entered to calculate GPA.");
      return;
    }

    setGpa((totalPoints / totalCredits).toFixed(2));
  };

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
      gradeNeeded = Math.min(gradeNeeded, 4); // Ensure it doesn't go above an A

      let gradeLetter = Object.keys(gradePoints).find(key => gradePoints[key] === gradeNeeded);
      requiredGrades.push({
        courseName: course.courseName,
        requiredGrade: gradeLetter,
      });

      pointsNeeded -= gradeNeeded * credits;
      if (pointsNeeded <= 0) break;
    }

    setRecommendedGrades(requiredGrades);

    // Now, call GPT-4 to suggest classes
    fetchGPTSuggestions(currentGPA, currentCredits, requiredGrades);
  };

  const getRemainingCredits = () => {
    return courses.filter(course => course.grade === "N/A")
                  .reduce((total, course) => total + course.credits, 0);
  };

  const fetchGPTSuggestions = async (currentGPA, currentCredits, requiredGrades) => {
    const openAIAPIKey = "YOUR_OPENAI_API_KEY"; // Replace with your actual OpenAI API key

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

  useEffect(() => {
    if (desiredGPA !== "") {
      calculateRecommendedGrades();
    }
  }, [desiredGPA, courses]);

  const handleGradeChange = (index, value) => {
    const updatedCourses = [...courses];
    updatedCourses[index].grade = value;
    setCourses(updatedCourses);
  };

  return (
    <div className="gpa-calculator-body" >
      <div className="gpa-calculator">
        <h1>GPA Calculator</h1>

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
          {loading ? "Loading..." : "Load Courses"}
        </button>

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
                      <select
                        value={course.grade}
                        onChange={(e) => handleGradeChange(index, e.target.value)}
                      >
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
            <button onClick={calculateGPA}>Calculate GPA</button>
          </div>
        )}

        <div className="target-gpa-container">
          <label>Desired GPA:</label>
          <input
            type="number"
            value={desiredGPA}
            onChange={(e) => setDesiredGPA(e.target.value)}
            min="0"
            max="4"
            step="0.1"
          />
        </div>

        {recommendedGrades && (
          <div className="recommended-grades">
            <h2>Recommended Grades to Reach Your Desired GPA:</h2>
            <ul>
              {Array.isArray(recommendedGrades) ? (
                recommendedGrades.map((item, index) => (
                  <li key={index}>{item.courseName}: {item.requiredGrade}</li>
                ))
              ) : (
                <p>{recommendedGrades}</p>
              )}
            </ul>
          </div>
        )}

{gptSuggestions && (
  <div className="gpt-suggestions">
    <h2>GPT-4 Recommendations:</h2>
    <p>{gptSuggestions}</p>
  </div>
)}

        {gpa && (
          <div className="gpa-result">
            <h2>Your GPA: {gpa}</h2>
          </div>
        )}
      </div>
    </div>
  );
}

export default GpaCalculator;
