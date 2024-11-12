// src/Login.js

import React, { useState } from 'react';
import './Login.css';
import logo from './assets/logo.png'; // Make sure your logo is placed in 'src/assets/logo.png'

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle login logic
  };

  return (
    <div className="login-page">
      <div className="left-side">
        <img src={logo} alt="Ease My Degree Logo" className="logo" />
        <p className="tagline">The future of academic planning.</p>
      </div>
      <div className="right-side">
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
          <p className="forgot-password">Forgot password?</p>
          <button type="submit">Login</button>
          <p className="create-account">
            Don’t have an account? <span>Create your account</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
