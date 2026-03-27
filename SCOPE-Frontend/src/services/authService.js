// src/services/authService.js

const API_BASE_URL = 'http://localhost:5000/api/auth';

export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  // If the backend sends an error (like 400 or 500), throw it to Register.jsx
  if (!response.ok) {
    const error = new Error('API Error');
    error.response = { data }; 
    throw error;
  }

  return data;
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error('API Error');
    error.response = { data };
    throw error;
  }

  return data;
};

export const logout = () => {
  // Clears the Token and User info from the browser's memory
  localStorage.removeItem('token');
  localStorage.removeItem('scope_user'); 
};