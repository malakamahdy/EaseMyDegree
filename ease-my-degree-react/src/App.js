// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Calculator from './Calculator'; // Import the Calculator page

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} /> {/* Login page */}
          <Route path="/calculator" element={<Calculator />} /> {/* Calculator page */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
