import React, { useState } from "react";
import "./GettingStarted.css"; // Optional if using CSS

function GettingStarted() {
  const [selectedSchool, setSelectedSchool] = useState("");

  const handleSchoolChange = (event) => {
    setSelectedSchool(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Selected School:", selectedSchool);
    alert(`You selected: ${selectedSchool}`);
  };

  return (
    <div className="getting-started-container">
      <div className="rectangle">
        <h1 className="title">Let’s get you started!</h1>
        <form onSubmit={handleSubmit} className="form">
          <label htmlFor="school" className="dropdown-label">
            What school do you go to?
          </label>
          <select
            id="school"
            value={selectedSchool}
            onChange={handleSchoolChange}
            className="dropdown"
          >
            <option value="" disabled>
              Select your school
            </option>
            <option value="TAMU-CC">TAMU-CC</option>
            <option value="UT">UT</option>
            <option value="Texas State">Texas State</option>
          </select>
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default GettingStarted;
