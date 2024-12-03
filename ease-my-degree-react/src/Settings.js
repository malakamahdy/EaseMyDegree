import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    startYear: '',
    expectedGraduation: '',
    major: '',
  });

  useEffect(() => {
    setUserData({
      name: 'John Doe',
      email: 'john@example.com',
      startYear: '2020',
      expectedGraduation: '2024',
      major: 'Computer Science',
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log('Settings saved:', userData);
    alert('Settings saved successfully!');
    // In a real app, you'd send this data to your backend here
  };

  return (
    <div className="settings-page">
      <div className="header">
        <h1>Settings</h1>
      </div>
      <div className="settings-form">
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
          />
        </label>
        <label>
          Catalog Year:
          <input
            type="number"
            name="startYear"
            value={userData.startYear}
            onChange={handleChange}
            min="1900"
            max="2099"
          />
        </label>
        <label>
          Expected Graduation Year:
          <input
            type="number"
            name="expectedGraduation"
            value={userData.expectedGraduation}
            onChange={handleChange}
            min="1900"
            max="2099"
          />
        </label>
        <label>
          Major:
          <select
            name="major"
            value={userData.major}
            onChange={handleChange}
          >
            <option value="">Select a major</option>
            <option value="Biology">Biology</option>
            <option value="Psychology">Psychology</option>
            <option value="Computer Science">Computer Science</option>
          </select>
        </label>
        <button onClick={handleSave}>Save Settings</button>
      </div>
    </div>
  );
};

export default Settings;