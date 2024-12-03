import React, { useState, useEffect } from 'react';
import './SemesterPlanner.css';  
import loadingGif from './assets/loading.gif'; // Ensure the import is correct

const SemesterPlanner = ({ semesterData }) => {
  const [loading, setLoading] = useState(true); // State to control loading

  // Simulating a data fetch or delay for loading state (use this for demo purposes)
  useEffect(() => {
    // Simulate loading for 3 seconds
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, []);

  return (
    <div className="semester-planner">
      <div className="header">
        Your personalized plan
      </div>

      {loading && (
        <div className="loading-container">
          <img src={loadingGif} alt="Loading..." className="loading-gif" />
        </div>
      )}

      {/* Render the semester tables here */}
      <div className="semester-tables">
        {semesterData.map((semester, index) => (
          <table className="semester-table" key={index}>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Course Number</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
              {semester.courses.map((course, courseIndex) => (
                <tr key={courseIndex}>
                  <td>{course.name}</td>
                  <td>{course.number}</td>
                  <td>{course.credits}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="2">Total Credits</td>
                <td>{semester.totalCredits}</td>
              </tr>
            </tbody>
          </table>
        ))}
      </div>
    </div>
  );
};

export default SemesterPlanner;
