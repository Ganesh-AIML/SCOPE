// src/modules/teacher/teacher.controller.js
const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const csv = require('csv-parser');
const { normalizeDept } = require('../../utils/formatters');

// Helper to get teacher's department
const getTeacherDept = async (userId) => {
  const teacher = await prisma.user.findUnique({
    where: { id: userId },
    include: { staffProfile: true }
  });
  return normalizeDept(teacher?.staffProfile?.department);
};

exports.getPendingStudents = async (req, res) => {
  try {
    let whereClause = { role: 'STUDENT', status: 'PENDING' };
    
    // Only restrict to department if the user is a standard TEACHER
    if (req.user.role === 'TEACHER') {
      const dept = await getTeacherDept(req.user.id);
      if (!dept) return res.status(403).json({ message: 'Teacher department not found' });
      whereClause.studentProfile = { branch: dept };
    }

    const pendingStudents = await prisma.user.findMany({
      where: whereClause,
      include: { studentProfile: true }
    });
    res.status(200).json(pendingStudents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending requests' });
  }
};

exports.getActiveStudents = async (req, res) => {
  try {
    let whereClause = { role: 'STUDENT', status: 'ACTIVE' };
    
    if (req.user.role === 'TEACHER') {
      const dept = await getTeacherDept(req.user.id);
      if (!dept) return res.status(403).json({ message: 'Teacher department not found' });
      whereClause.studentProfile = { branch: dept };
    }

    const activeStudents = await prisma.user.findMany({
      where: whereClause,
      include: { studentProfile: true }
    });
    res.status(200).json(activeStudents);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student directory' });
  }
};

exports.bulkResetPasswords = async (req, res) => {
  try {
    let whereClause = { role: 'STUDENT' };
    
    if (req.user.role === 'TEACHER') {
      const dept = await getTeacherDept(req.user.id);
      if (!dept) return res.status(403).json({ message: 'Teacher department not found' });
      whereClause.studentProfile = { branch: dept };
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password', salt);

    const result = await prisma.user.updateMany({
      where: whereClause,
      data: { passwordHash }
    });
    
    res.status(200).json({ message: `Success! ${result.count} student passwords were reset to "password"` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to bulk reset passwords' });
  }
};

exports.approveStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const dept = await getTeacherDept(req.user.id);

    const student = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true }
    });

    if (!student || student.studentProfile?.branch !== dept) {
      return res.status(403).json({ message: 'Unauthorized: Student not in your department' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: 'ACTIVE' }
    });
    res.status(200).json({ message: 'Student approved successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve student' });
  }
};

exports.rejectStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const dept = await getTeacherDept(req.user.id);

    const student = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true }
    });

    if (!student || student.studentProfile?.branch !== dept) {
      return res.status(403).json({ message: 'Unauthorized: Student not in your department' });
    }

    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: 'Student registration rejected and removed.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject student' });
  }
};

exports.resetStudentPassword = async (req, res) => {
  try {
    const { id } = req.body;
    const dept = await getTeacherDept(req.user.id);

    const student = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true }
    });

    if (!student || student.studentProfile?.branch !== dept) {
      return res.status(403).json({ message: 'Unauthorized: Student not in your department' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password', salt);

    await prisma.user.update({
      where: { id },
      data: { passwordHash }
    });
    res.status(200).json({ message: 'Password reset to "password"' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

exports.bulkUploadStudents = async (req, res) => {
  const filePath = req.file?.path;
  if (!filePath) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const studentsData = [];
    const stream = fs.createReadStream(filePath).pipe(csv({
      headers: ['name', 'email', 'password', 'branch', 'year', 'division', 'batch', 'rollNo', 'tnpRollNo'],
      skipLines: 0 
    }));

    for await (const row of stream) {
      if (row.email && row.name) {
        if (row.email.toLowerCase().includes('email') || row.name.toLowerCase().includes('name')) continue;
        studentsData.push(row);
      }
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const data of studentsData) {
      try {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
          failCount++;
          errors.push(`${data.email}: Already registered`);
          continue;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password || 'password123', salt);
        const cleanBranch = normalizeDept(data.branch);

        await prisma.user.create({
          data: {
            name: data.name,
            email: data.email,
            passwordHash,
            role: 'STUDENT',
            status: 'PENDING',
            studentProfile: {
              create: {
                branch: cleanBranch,
                year: data.year,
                division: data.division,
                batch: data.batch,
                rollNo: data.rollNo,
                tnpRollNo: data.tnpRollNo
              }
            }
          }
        });
        successCount++;
      } catch (err) {
        failCount++;
        errors.push(`${data.email}: ${err.message}`);
      }
    }

    fs.unlinkSync(filePath);
    res.status(200).json({ 
      message: `Bulk upload complete. ${successCount} added, ${failCount} failed.`,
      successCount, failCount, errors 
    });
  } catch (error) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: 'Failed to process CSV file' });
  }
};