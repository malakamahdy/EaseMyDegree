import React, { useEffect, useState } from "react";
import "./Dashboard.css"; // Create a separate CSS file for Dashboard styles
import logo from "./assets/logo.png"; // Assuming you are using the same logo as the login page
import { useNavigate } from "react-router-dom"; // Import useNavigate from React Router

function Dashboard() {
  const [user, setUser] = useState(null);

  const navigate = useNavigate(); // Hook from React Router to navigate programmatically

  useEffect(() => {
    // Get the user data from localStorage (set during login)
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    if (userData) {
      setUser(userData);
    }
  }, []);

  if (!user) {
    return <p>Loading...</p>;
  }

  const handleGoToCalculator = () => {
    navigate("/calculator"); // Navigate to the GPA Calculator page
  };
  const handleGoToSuggestions = () => {
    navigate("/SemesterPlanner");
  };
  const handleGoToCareerCounselor = () => {
    navigate("/CareerCounselor");
  };

  return (
    <div className="dashboard-page">
      <div className="left-side">
        <img src={logo} alt="Ease My Degree Logo" className="logo" />
        <p className="tagline">The future of academic planning.</p>
      </div>
      <div className="right-side">
        <div className="dashboard-rectangle">
          <h2>Welcome back, {user.name}!</h2>
          <p>Email: {user.email}</p>
          <div className="menu-buttons">
            <button
              onClick={handleGoToSuggestions}
              className="go-to-suggestions-button"
            >
              Semester by Semester Suggestions
            </button>

            {/* Button to navigate to the GPA Calculator */}
            <button
              onClick={handleGoToCalculator}
              className="go-to-calculator-button"
            >
              GPA Calculator
            </button>
            {/* Add get started button*/}
            <button
              onClick={handleGoToCareerCounselor}
              className="go-to-getting-counselor-button"
            >
              Career Counselor
            </button>
            <button onClick={() => localStorage.removeItem("loggedInUser")}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;