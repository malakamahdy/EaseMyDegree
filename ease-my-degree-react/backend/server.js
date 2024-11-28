const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser'); // CSV parsing
const jwt = require('jsonwebtoken'); // Authentication
const bcrypt = require('bcrypt'); // Password hashing
require('dotenv').config();
const { createObjectCsvWriter } = require('csv-writer');

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json()); // Parses incoming JSON requests

// Dummy in-memory user store (replace with database)
let users = [
  {
    id: 1,
    email: 'user@example.com',
    password: '$2a$10$Q4n2sFk2sJmFk3xCXP/j9.k8npNm8F5PbcGqAY9ZITgs5gFzqgk0W', // hashed 'password123'
    preferences: { school: 'TAMU-CC' },
    graduationDate: '2025-05-15',
  },
];

// Function to read CSV file based on the user's school
const readCsvFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

// Middleware to verify JWT tokens
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    req.user = user;
    next();
  });
};

// Serve static CSV files from /data
app.use('/data', express.static(path.join(__dirname, 'data')));

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err) throw err;

    if (isMatch) {
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  });
});

const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Update the route to handle CSV file creation
app.post('/api/update-courses', authenticateToken, async (req, res) => {
  const { updatedCourses } = req.body;

  if (!updatedCourses) {
    return res.status(400).json({ message: 'Course data is required.' });
  }

  // Define the template file path
  const school = req.user.preferences.school;
  const templateFilePath = path.join(__dirname, 'data', `${school}_degree_template.csv`);

  // Read the template CSV file
  const templateCourses = await readCsvFile(templateFilePath);
  
  // Add new data to the template (credit received and grade)
  const updatedCoursesData = templateCourses.map((course, index) => ({
    ...course,
    creditReceived: updatedCourses[index]?.creditReceived || "No",
    grade: updatedCourses[index]?.grade || "N/A"
  }));

  // Create a new CSV with updated data
  const csvWriter = createCsvWriter({
    path: path.join(__dirname, 'data', 'user_ClassesInfo.csv'), // Use 'user_ClassesInfo.csv'
    header: [
      { id: 'courseName', title: 'Course Name' },
      { id: 'courseNumber', title: 'Course Number' },
      { id: 'credits', title: 'Credits' },
      { id: 'prerequisite', title: 'Prerequisite' },
      { id: 'creditReceived', title: 'Credit Received' },
      { id: 'grade', title: 'Grade' }
    ]
  });

  try {
    // Write updated courses to the new CSV file
    await csvWriter.writeRecords(updatedCoursesData);

    res.status(200).json({ message: 'Course data saved as user_ClassesInfo.csv' });
  } catch (error) {
    console.error('Error creating CSV:', error);
    res.status(500).json({ message: 'Error creating CSV file' });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
