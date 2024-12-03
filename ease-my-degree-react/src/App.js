// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import GpaCalculator from './GpaCalculator';
import SemesterPlanner from './SemesterPlanner'; 
<<<<<<< HEAD
import CareerCounselor from './CareerCounselor';
=======
import GettingStarted from './GettingStarted';
import Settings from './Settings';
>>>>>>> 8cb65c00fb7d88fac2a766234928d42861d852bc

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
<<<<<<< HEAD
        <Route path="/careercounselor" element={<CareerCounselor />} />
=======
        <Route path="/gettingstarted" element={<GettingStarted />} />
        <Route path="/settings" element={<Settings />} />
>>>>>>> 8cb65c00fb7d88fac2a766234928d42861d852bc
      </Routes>
    </Router>
  );
}

export default App;
