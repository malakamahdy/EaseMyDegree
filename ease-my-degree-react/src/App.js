// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import GpaCalculator from './GpaCalculator';
import SemesterPlanner from './SemesterPlanner'; 
import CareerCounselor from './CareerCounselor';
import GettingStarted from './GettingStarted';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calculator" element={<GpaCalculator />} />
        <Route path="/semesterplanner" element={<SemesterPlanner />} />
        <Route path="/careercounselor" element={<CareerCounselor />} />
        <Route path="/gettingstarted" element={<GettingStarted />} />
      </Routes>
    </Router>
  );
}

export default App;
