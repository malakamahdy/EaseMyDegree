const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');  // Import the CSV parser
require('dotenv').config();

const apiKey = process.env.API_KEY;  // Now you can access the API key securely

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
    preferences: {},
    graduationDate: "2025-05-15",  // Example graduation date
  },
];

// Function to read CSV file based on the user's graduation date or degree plan
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

    req.user = user; // Add user info to the request
    next();
  });
};

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  // Compare hashed passwords
  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err) throw err;

    if (isMatch) {
      // Create JWT token (using a secret key)
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Respond with the token
      res.json({ token });
    } else {
      res.status(400).json({ message: 'Invalid credentials' });
    }
  });
});

// Fetch degree plans based on user's graduation date
app.get('/api/degree-plans', authenticateToken, async (req, res) => {
  const userId = req.user.id;  // Get user ID from the token

  // Find user by ID
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Use graduationDate or preferences to select the correct CSV file
  const filePath = path.join(__dirname, `data/degree_plans_${user.graduationDate}.csv`);  // Adjust filename based on graduation date or preferences

  try {
    const degreePlans = await readCsvFile(filePath);
    res.json(degreePlans);
  } catch (error) {
    res.status(500).json({ message: 'Error reading degree plan file', error });
  }
});

// Fetch user info
app.get('/api/users/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ id: user.id, email: user.email, graduationDate: user.graduationDate, preferences: user.preferences });
});

// Save user preferences
app.post('/api/users/:id/preferences', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.preferences = req.body; // Save preferences (replace with database logic in production)
  res.json({ message: 'Preferences saved', preferences: user.preferences });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
