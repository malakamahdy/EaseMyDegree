import React, { useState } from 'react';
import './App.css';

function App() {
  const [isBarVisible, setIsBarVisible] = useState(false);

  // Toggle the visibility of the sliding bar
  const toggleBar = () => {
    setIsBarVisible(!isBarVisible);
  };

  return (
    <div className="App">
      <header className={`sliding-bar ${isBarVisible ? 'visible' : ''}`}>
        <h3>User History</h3>
        <ul>
          <li>Previous Search 1</li>
          <li>Previous Search 2</li>
          <li>Previous Search 3</li>
        </ul>
      </header>
      <div className="menu" onClick={toggleBar}>
        {/* Hamburger icon */}
        <div className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
      <div className={`search-container ${isBarVisible ? 'shifted' : ''}`}>
        <input 
          type="text" 
          className="search-bar" 
          placeholder="How can I help?" 
        />
      </div>
    </div>
  );
}

export default App;
