// src/userStore.js

// In-memory store for user data
let users = [];

// Add a new user to the store
export const addUser = (user) => {
  users.push(user);
};

// Get user by email (used for login)
export const getUserByEmail = (email) => {
  return users.find(user => user.email === email);
};

// Get user by username
export const getUserByUsername = (username) => {
  return users.find(user => user.username === username);
};

// Get all users (for testing or debugging)
export const getAllUsers = () => {
  return users;
};

// Update user's course data
export const updateUserCourses = (username, updatedCourses) => {
  const user = getUserByUsername(username);
  if (user) {
    user.courses = updatedCourses;
  } else {
    throw new Error('User not found');
  }
};
