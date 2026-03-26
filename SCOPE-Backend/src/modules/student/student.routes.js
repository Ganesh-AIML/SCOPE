const express = require('express');
const router = express.Router();
const studentController = require('./student.controller');

// List of live exams
router.get('/available-tests', studentController.getAvailableTests);

// Deep fetch for the Exam Workspace (STRIPPED answers)
router.get('/exam/:id', studentController.getExamDetails);

// Submit the completed exam
router.post('/exam/:id/submit', studentController.submitExam);

// Fetch analysis for a specific test
router.get('/analysis/:id', studentController.getAnalysis);

module.exports = router;