import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Register from './Register'; // Assuming you have this page
import Calculator from './Calculator'; // Assuming you have this page

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> {/* This is the root route */}
        <Route path="/register" element={<Register />} />
        <Route path="/calculator" element={<Calculator />} />
      </Routes>
    </Router>
  );
}

export default App;
