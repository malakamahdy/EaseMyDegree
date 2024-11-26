import React, { useState, useEffect } from "react";
import axios from "axios";
import "./GettingStarted.css";

function GettingStarted() {
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [courses, setCourses] = useState([]);
  const [responses, setResponses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch courses based on school and major selection
  const fetchCourses = async (school, major) => {
    try {
      setLoading(true);
      const response = await axios.get(`/templates/${school}_${major}.csv`);
      const parsedCourses = parseCSV(response.data);
      setCourses(parsedCourses);
      setResponses(new Array(parsedCourses.length).fill({ creditReceived: "", grade: "N/A" }));
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (csvData) => {
    const rows = csvData.split("\n");
    const parsed = rows.map((row) => {
      const cols = row.split(",");
      return {
        courseName: cols[0],
        courseNumber: cols[1],
        credits: cols[2],
        prerequisite: cols[3],
        creditReceived: "",
        grade: "N/A",
      };
    });
    return parsed;
  };

  const handleSchoolChange = (event) => {
    setSchool(event.target.value);
  };

  const handleMajorChange = (event) => {
    setMajor(event.target.value);
    fetchCourses(school, event.target.value); // fetch courses when major is selected
  };

  const handleCreditReceivedChange = (index, value) => {
    const newResponses = [...responses];
    newResponses[index] = { ...newResponses[index], creditReceived: value };
    setResponses(newResponses);
  };

  const handleGradeChange = (index, value) => {
    const newGrades = [...grades];
    newGrades[index] = value;
    setGrades(newGrades);
  };

  const handleSubmit = async () => {
    const updatedCourses = courses.map((course, index) => ({
      ...course,
      creditReceived: responses[index]?.creditReceived || "No",
      grade: grades[index] || "N/A",
    }));

    // Send the updated courses to backend
    try {
      await axios.post("http://localhost:5001/api/update-courses", {
        school,
        major,
        updatedCourses,
      });
      alert("Your course data has been updated successfully!");
    } catch (error) {
      console.error("Error updating courses:", error);
      alert("Failed to update course data.");
    }
  };

  return (
    <div className="getting-started">
      <div className="header">
        <h1>Let's get you started!</h1>
      </div>

      <div className="form">
        <label htmlFor="school">Select your school:</label>
        <select id="school" value={school} onChange={handleSchoolChange}>
          <option value="TAMU-CC">TAMU-CC</option>
          <option value="UT">UT</option>
          <option value="TexasState">Texas State</option>
        </select>

        <label htmlFor="major">Select your major:</label>
        <select id="major" value={major} onChange={handleMajorChange}>
          <option value="ComputerScience">Computer Science</option>
          <option value="Psychology">Psychology</option>
          <option value="Biology">Biology</option>
        </select>
      </div>

      <div className="courses">
        {loading ? (
          <p>Loading courses...</p>
        ) : (
          <>
            <h2>Courses</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Credits</th>
                    <th>Prerequisite</th>
                    <th>Credit Received</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, index) => (
                    <tr key={index}>
                      <td>{course.courseName}</td>
                      <td>{course.credits}</td>
                      <td>{course.prerequisite}</td>
                      <td>
                        <select
                          value={responses[index]?.creditReceived || ""}
                          onChange={(e) => handleCreditReceivedChange(index, e.target.value)}
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                      <td>
                        {responses[index]?.creditReceived === "Yes" ? (
                          <select
                            value={grades[index] || ""}
                            onChange={(e) => handleGradeChange(index, e.target.value)}
                          >
                            <option value="">Select</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                            <option value="F">F</option>
                          </select>
                        ) : (
                          <span>No Grade</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={handleSubmit}>Submit</button>
          </>
        )}
      </div>
    </div>
  );
}

export default GettingStarted;
