// src/modules/admin/admin.controller.js
const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');

exports.getPendingStaff = async (req, res) => {
  try {
    const pendingStaff = await prisma.user.findMany({
      where: {
        role: { in: ['TEACHER', 'TNP_ADMIN'] },
        status: 'PENDING'
      },
      include: { staffProfile: true }
    });
    res.status(200).json(pendingStaff);
  } catch (error) {
    console.error("Error fetching pending staff:", error);
    res.status(500).json({ message: 'Failed to fetch pending requests' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    // 🛡️ MEDIUM FIX: Select specific fields to exclude passwordHash
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        staffProfile: true,
        studentProfile: true
      }
    });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'Failed to fetch users directory' });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' }
    });
    res.status(200).json({ message: 'User approved successfully', user: updatedUser });
  } catch (error) {
    console.error("Error approving user:", error);
    res.status(500).json({ message: 'Failed to approve user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.body;
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password', salt);
    await prisma.user.update({
      where: { id },
      data: { passwordHash }
    });
    res.status(200).json({ message: 'Password reset to "password"' });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

exports.bulkResetPasswords = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password', salt);
    await prisma.user.updateMany({
      where: { role: { in: ['TEACHER', 'TNP_ADMIN'] } },
      data: { passwordHash }
    });
    res.status(200).json({ message: `All Staff passwords reset to "password"` });
  } catch (error) {
    console.error("Error bulk resetting passwords:", error);
    res.status(500).json({ message: 'Failed to bulk reset passwords' });
  }
};