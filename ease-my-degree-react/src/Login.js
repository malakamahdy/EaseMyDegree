// src/Login.js

import React, { useState } from 'react';
import './Login.css';
import logo from './assets/logo.png'; // Assuming you are using the same logo as the login page
import axios from 'axios'; // Import axios for making HTTP requests
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      
      // Store the JWT token in localStorage (or use cookies for more security)
      localStorage.setItem('token', response.data.token);

      // Redirect to another page (e.g., dashboard)
      window.location.href = '/dashboard';  // Adjust the redirect as needed
    } catch (error) {
      setErrorMessage(error.response ? error.response.data.message : 'An error occurred');
    }
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
            {errorMessage && <p className="error">{errorMessage}</p>} {/* Show error message if any */}
            <button type="submit">Login</button>
            <p className="create-account">
              Don’t have an account? <Link to="/register"><span>Create your account</span></Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
