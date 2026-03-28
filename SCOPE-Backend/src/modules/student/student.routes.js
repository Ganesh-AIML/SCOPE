const express = require('express');
const router = express.Router();
const studentController = require('./student.controller');
const { protect, restrictTo } = require('../../middleware/auth.middleware');

// 🔒 Protect all student routes
router.use(protect);

// Only students can see available tests and submit
router.get('/available-tests', restrictTo('STUDENT'), studentController.getAvailableTests);
router.get('/exam/:id', restrictTo('STUDENT'), studentController.getExamDetails);
router.post('/exam/:id/submit', restrictTo('STUDENT'), studentController.submitExam);

// Students and Teachers/TnP can view analysis
router.get('/analysis/:id', restrictTo('STUDENT', 'TEACHER', 'TNP_ADMIN'), studentController.getAnalysis);

// 🛡️ NEW FEATURE: Update Password Route
router.put('/update-password', restrictTo('STUDENT'), studentController.updatePassword);

module.exports = router;