// src/modules/teacher/teacher.routes.js
const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const teacherController = require('./teacher.controller');
const { protect, restrictTo } = require('../../middleware/auth.middleware');

// Protect all teacher routes using OUR middleware
router.use(protect);
router.use(restrictTo('TEACHER', 'SUPER_ADMIN', 'TNP_ADMIN'));

router.get('/students/pending', teacherController.getPendingStudents);
router.get('/students/active', teacherController.getActiveStudents);
router.put('/students/approve/:id', teacherController.approveStudent);
router.delete('/students/reject/:id', teacherController.rejectStudent);
router.put('/students/reset-password', teacherController.resetStudentPassword);
router.put('/students/bulk-reset', teacherController.bulkResetPasswords);
router.post('/students/bulk-upload', upload.single('file'), teacherController.bulkUploadStudents);

module.exports = router;