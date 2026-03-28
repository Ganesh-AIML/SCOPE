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
    const student = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true }
    });

    if (!student) return res.status(404).json({ message: 'Student not found' });

    // 🛡️ FIX: Only restrict branch if the user is a Teacher
    if (req.user.role === 'TEACHER') {
      const dept = await getTeacherDept(req.user.id);
      if (student.studentProfile?.branch !== dept) {
        return res.status(403).json({ message: 'Unauthorized: Student not in your department' });
      }
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
    const student = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true }
    });

    if (!student) return res.status(404).json({ message: 'Student not found' });

    // 🛡️ FIX: Only restrict branch if the user is a Teacher
    if (req.user.role === 'TEACHER') {
      const dept = await getTeacherDept(req.user.id);
      if (student.studentProfile?.branch !== dept) {
        return res.status(403).json({ message: 'Unauthorized: Student not in your department' });
      }
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
    
    const student = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true }
    });

    if (!student) return res.status(404).json({ message: 'Student not found' });

    // 🛡️ FIX: Only restrict branch if the user is a Teacher
    if (req.user.role === 'TEACHER') {
      const dept = await getTeacherDept(req.user.id);
      if (student.studentProfile?.branch !== dept) {
        return res.status(403).json({ message: 'Unauthorized: Student not in your department' });
      }
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
    const stream = fs.createReadStream(filePath).pipe(csv());

    for await (const row of stream) {
      const cleanRow = {};
      for (let key in row) {
        cleanRow[key.trim().toLowerCase()] = row[key]?.trim();
      }
      if (cleanRow.email && cleanRow.name) {
        studentsData.push(cleanRow);
      }
    }

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    for (const data of studentsData) {
      try {
        const email = data.email.toLowerCase();
        
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          failCount++;
          errors.push(`${email}: Already registered in database.`);
          continue; 
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password || 'password123', salt);
        const cleanBranch = normalizeDept(data.branch);

        await prisma.user.create({
          data: {
            name: data.name,
            email: email,
            passwordHash,
            role: 'STUDENT',
            status: 'ACTIVE', 
            studentProfile: {
              create: {
                branch: cleanBranch || 'General',
                year: parseInt(data.year) || 1,
                division: data.division || 'A',
                batch: data.batch || '2025',
                rollNo: data.rollno || `TEMP-${Math.floor(Math.random()*1000)}`,
                tnpRollNo: data.tnprollno || ''
              }
            }
          }
        });
        successCount++;
      } catch (rowError) {
        failCount++;
        const reason = rowError.message.split('\n').pop() || "Database constraints error";
        errors.push(`${data.email}: ${reason}`);
      }
    }

    fs.unlinkSync(filePath);
    res.status(200).json({ 
      message: `Bulk upload processed. ${successCount} added, ${failCount} skipped/failed.`,
      successCount, failCount, errors 
    });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ message: 'Fatal error parsing CSV file. Check formatting.' });
  }
};