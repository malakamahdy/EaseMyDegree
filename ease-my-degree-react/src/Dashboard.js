import React, { useEffect, useState } from "react";
import "./Dashboard.css"; // Dashboard styles
import logo from "./assets/logo.png"; // Assuming the logo path is correct
import { useNavigate } from "react-router-dom"; // React Router hook

function Dashboard() {
  const [user, setUser] = useState(null); // User state
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Fetch user data from localStorage
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    if (userData) {
      setUser(userData);
    } else {
      // If no user is found, redirect to the login page
      navigate("/login");
    }
  }, [navigate]);

  if (!user) {
    return <p>Loading...</p>;
  }

  const handleGoToCalculator = () => {
    navigate("/calculator"); // Navigate to GPA Calculator page
  };

  const handleGoToSuggestions = () => {
    navigate("/SemesterPlanner"); // Navigate to Semester Planner page
  };

  const handleGoToCareerCounselor = () => {
    navigate("/CareerCounselor"); // Navigate to Career Counselor page
  };

  const handleLogout = () => {
    // Clear user data and redirect to login
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <img src={logo} alt="Ease My Degree Logo" className="logo" />
      </aside>
      <main className="main-content">
        <h1>How can I ease your degree today, {user.name}?</h1>
        <div className="options-grid">
          <button className="option-card" onClick={handleGoToSuggestions}>
            Semester Planner
          </button>
          <button className="option-card" onClick={handleGoToCareerCounselor}>
            Career Counselor
          </button>
          <button className="option-card" onClick={handleGoToCalculator}>
            GPA Calculator
          </button>
          <button className="option-card logout" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
