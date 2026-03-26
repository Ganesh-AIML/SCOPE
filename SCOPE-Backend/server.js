const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize Express App
const app = express();

// Middleware
app.use(cors()); // Allows your React frontend to communicate with this backend
app.use(express.json()); // Allows the server to read JSON data from requests

// Basic Health Check Route
app.get('/', (req, res) => {
  res.send('S.C.O.P.E. Engine Backend is Running!');
});

// --- MODULE ROUTES ---
// This connects the TNP Admin routes we just created
app.use('/api/tnp', require('./src/modules/tnp/tnp.routes'));

app.use('/api/student', require('./src/modules/student/student.routes'));







// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 S.C.O.P.E. Server running on port ${PORT}`);
});