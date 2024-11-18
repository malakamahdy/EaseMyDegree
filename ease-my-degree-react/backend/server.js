// server.js

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json()); // Parses incoming JSON requests

// Dummy in-memory user store (replace with database)
let users = [
  { id: 1, email: 'user@example.com', password: '$2a$10$Q4n2sFk2sJmFk3xCXP/j9.k8npNm8F5PbcGqAY9ZITgs5gFzqgk0W', // hashed 'password123'
  }
];

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = users.find(user => user.email === email);

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
