// src/Register.js

import React, { useState } from 'react';
import './Register.css';
import { addUser, getUserByEmail } from './userStore'; // Ensure the import is correct
import { useNavigate } from 'react-router-dom';
import logo from './assets/logo.png'; // Assuming you are using the same logo as the login page
import axios from 'axios'; // Import axios for making HTTP requests

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    // Check if the email is already registered
    if (getUserByEmail(email)) {
      setErrorMessage('Email is already registered');
      return;
    }

    // Add user to in-memory store with the name
    addUser({ name, email, password });

    // Redirect to login page after successful registration
    navigate('/login');
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
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
            {errorMessage && <p className="error">{errorMessage}</p>}
            <button type="submit">Register</button>
            <p className="login-link">
              Already have an account? <span onClick={() => navigate('/login')}>Login</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
