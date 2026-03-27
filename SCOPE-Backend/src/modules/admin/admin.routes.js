// src/modules/admin/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { protect, restrictTo } = require('../../middleware/auth.middleware');

// Protect all admin routes using OUR middleware
router.use(protect);
router.use(restrictTo('SUPER_ADMIN'));

router.get('/users/pending', adminController.getPendingStaff);
router.get('/users/all', adminController.getAllUsers);
router.put('/users/approve/:id', adminController.approveUser);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/reset-password', adminController.resetPassword);
router.put('/users/bulk-reset', adminController.bulkResetPasswords);

module.exports = router;