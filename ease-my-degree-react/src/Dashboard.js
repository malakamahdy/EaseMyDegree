// Dashboard.js
// Acts as a "hub" to navigate to the different features of EaseMyDegree.

// Import necessary modules and assets
import React, { useEffect, useState } from "react"; // React and hooks for state and lifecycle management
import "./Dashboard.css"; // CSS for Dashboard styling
import logo from "./assets/logo.png"; // Logo image for the dashboard
import { useNavigate } from "react-router-dom"; // React Router hook for navigation

// Define the Dashboard component
function Dashboard() {
  const [user, setUser] = useState(null); // State to hold the logged-in user data
  const navigate = useNavigate(); // Hook for navigating between routes

  useEffect(() => {
    // Fetch the user data from localStorage
    const userData = JSON.parse(localStorage.getItem("loggedInUser"));
    if (userData) {
      setUser(userData); // Set user data if found
    } else {
      // Redirect to login page if no user is found
      navigate("/login");
    }
  }, [navigate]); // Dependency on navigate to avoid stale closure issues

  // Show a loading message while user data is being fetched
  if (!user) {
    return <p>Loading...</p>;
  }

  // Navigate to the Semester Planner page
  const handleGoToCalculator = () => {
    navigate("/calculator");
  };

  // Navigate to the Semester Planner page
  const handleGoToSuggestions = () => {
    navigate("/SemesterPlanner");
  };

  // Navigate to the Career Counselor page
  const handleGoToCareerCounselor = () => {
    navigate("/CareerCounselor");
  };

  // Clear user data and redirect to the login page
  const handleLogout = () => {
    localStorage.removeItem("loggedInUser"); // Remove user data from localStorage
    navigate("/login"); // Redirect to login
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar with logo */}
      <aside className="sidebar">
        <img src={logo} alt="Ease My Degree Logo" className="logo" />
      </aside>

      {/* Main content area */}
      <main className="main-content">
        {/* Personalized greeting with user's name */}
        <h1>How can I ease your degree today, {user.name}?</h1>

        {/* Grid of option buttons */}
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

// Export the Dashboard component for use in the application
export default Dashboard;
