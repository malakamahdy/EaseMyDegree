// Login.js
// Handles user's login

import React, { useState } from 'react';
import './Login.css';
import { getUserByEmail } from './userStore'; // Import the function
import { useNavigate } from 'react-router-dom';
import logo from './assets/logo.png'; // Assuming you are using the same logo as the login page

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    // Check if the email exists
    const user = getUserByEmail(email);

    // Check if user is found and the password matches
    if (!user || user.password !== password) {
      setErrorMessage('Invalid email or password');
      return;
    }

    // Store the user data in localStorage for use on the dashboard
    localStorage.setItem('loggedInUser', JSON.stringify(user));

    // Redirect to the dashboard page after successful login
    navigate('/dashboard');
  };

  return (
    <div className="login-page">
      <div className="left-side">
      <img src={logo} alt="Ease My Degree Logo" className="logo" />
        <p className="tagline">The future of academic planning.</p>
      </div>
      <div className="right-side">
        <div className="login-rectangle">
          <h2>Welcome back!</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errorMessage && <p className="error">{errorMessage}</p>}
            <button type="submit">Login</button>
            <p className="create-account">
              Don’t have an account? <span onClick={() => navigate('/register')}>Create your account</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;