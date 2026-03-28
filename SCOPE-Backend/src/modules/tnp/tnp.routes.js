const express = require('express');
const router = express.Router();
const tnpController = require('./tnp.controller');
const { protect, restrictTo } = require('../../middleware/auth.middleware');

// 🔒 All TNP routes require being a TNP_ADMIN or SUPER_ADMIN
router.use(protect);
router.use(restrictTo('TNP_ADMIN', 'SUPER_ADMIN'));

router.post('/schedule', tnpController.scheduleTest);
router.get('/all-tests', tnpController.getAllTests);
router.get('/test/:id', tnpController.getTestById);
router.delete('/test/:id', tnpController.deleteTest);
router.get('/performance/:testId/:studentId', tnpController.getStudentPerformance);

// 🛡️ THE ROOT FIX: Secure endpoint for dynamic chart aggregation
router.get('/test/:id/analytics', tnpController.getTestAnalytics);

module.exports = router;