// src/Register.js

import React, { useState } from 'react';
import './Register.css';
import logo from './assets/logo.png'; // Assuming you are using the same logo as the login page
import axios from 'axios'; // Import axios for making HTTP requests

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/register', { email, password });

      // Redirect to login page after successful registration
      window.location.href = '/login';
    } catch (error) {
      setErrorMessage(error.response ? error.response.data.message : 'An error occurred');
    }
  };

  return (
    <div className="register-page">
      <div className="left-side">
        <img src={logo} alt="Ease My Degree Logo" className="logo" />
        <p className="tagline">The future of academic planning.</p>
      </div>
      <div className="right-side">
        <div className="register-rectangle">
          <h2>Create an account</h2>
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
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errorMessage && <p className="error">{errorMessage}</p>} {/* Show error message if any */}
            <button type="submit">Register</button>
            <p className="login-link">
              Already have an account? <span>Login</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
