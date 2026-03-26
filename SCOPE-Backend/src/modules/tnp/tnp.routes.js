const express = require('express');
const router = express.Router();
const tnpController = require('./tnp.controller');

// Create a new test
router.post('/tests/schedule', tnpController.scheduleTest);

// Get all tests
router.get('/tests', tnpController.getAllTests);

// Get a single test's full details
router.get('/tests/:id', tnpController.getTestById);

// Delete a test
router.delete('/tests/:id', tnpController.deleteTest);

// Get deep-dive analytics for a single student's test attempt
router.get('/tests/:testId/performance/:studentId', tnpController.getStudentPerformance);

module.exports = router;