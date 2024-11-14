import React, { useState } from "react";
import "./Calculator.css";

const GpaCalculator = () => {
  const [courses, setCourses] = useState([]);
  const [courseName, setCourseName] = useState("");
  const [creditHours, setCreditHours] = useState("");
  const [grade, setGrade] = useState("");

  const gradeToPoints = (grade) => {
    switch (grade.toUpperCase()) {
      case "A":
        return 4.0;
      case "B":
        return 3.0;
      case "C":
        return 2.0;
      case "D":
        return 1.0;
      case "F":
        return 0.0;
      default:
        return null;
    }
  };

  const addCourse = () => {
    const parsedCreditHours = parseFloat(creditHours);
    const gradePoints = gradeToPoints(grade);

    if (!courseName || isNaN(parsedCreditHours) || gradePoints === null) {
      alert("Please fill in valid course information.");
      return;
    }

    setCourses([
      ...courses,
      { name: courseName, creditHours: parsedCreditHours, grade, gradePoints },
    ]);
    setCourseName("");
    setCreditHours("");
    setGrade("");
  };

  const calculateGpa = () => {
    const totalCredits = courses.reduce(
      (acc, course) => acc + course.creditHours,
      0
    );
    const totalPoints = courses.reduce(
      (acc, course) => acc + course.creditHours * course.gradePoints,
      0
    );
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  return (
    <div className="gpa-calculator">
      <h1>GPA Calculator</h1>
      <div className="input-group">
        <input
          type="text"
          placeholder="Course Name"
          value={courseName}
          onChange={(e) => setCourseName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Credit Hours"
          value={creditHours}
          onChange={(e) => setCreditHours(e.target.value)}
        />
        <input
          type="text"
          placeholder="Grade (A-F)"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />
        <button onClick={addCourse}>Add Course</button>
      </div>
      <div className="courses-list">
        <h2>Courses Added:</h2>
        <ul>
          {courses.map((course, index) => (
            <li key={index}>
              {course.name}: {course.creditHours} Credit Hours, Grade:{" "}
              {course.grade}
            </li>
          ))}
        </ul>
      </div>
      <h2 className="gpa">Current GPA: {calculateGpa()}</h2>
    </div>
  );
};

export default GpaCalculator;
