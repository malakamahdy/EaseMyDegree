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

// Get all users (for testing or debugging)
export const getAllUsers = () => {
  return users;
};
