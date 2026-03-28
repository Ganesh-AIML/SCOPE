// src/modules/auth/auth.controller.js
const prisma = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { normalizeDept } = require('../../utils/formatters');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

exports.register = async (req, res) => {
  try {
    // 1. Extract ALL fields sent from the frontend Register.jsx payload
    const { 
      name, email, password, role, department, 
      division, batch, year, rollNo, tnpRollNo, designation 
    } = req.body;

    if (role === 'admin' || role === 'SUPER_ADMIN') {
      return res.status(403).json({ message: 'Cannot register as Super Admin directly.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const roleEnum = role === 'tnp' ? 'TNP_ADMIN' : role.toUpperCase();
    const normalizedDeptString = normalizeDept(department || 'General');

    // 🛡️ THE ROOT FIX: Atomic Transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: roleEnum,
          status: 'PENDING', 
        }
      });

      if (roleEnum === 'STUDENT') {
        // Provide all mandatory fields defined in schema.prisma
        await tx.studentProfile.create({
          data: { 
            userId: user.id, 
            branch: normalizedDeptString,
            rollNo: rollNo || `TMP-${Math.floor(Math.random() * 100000)}`,
            tnpRollNo: tnpRollNo || `TNP-${Math.floor(Math.random() * 100000)}`,
            division: division || 'N/A',
            batch: batch || 'N/A',
            year: year || 'N/A'
          }
        });
      } else if (roleEnum === 'TEACHER') {
        await tx.staffProfile.create({
          data: { 
            userId: user.id, 
            department: normalizedDeptString,
            designation: designation || 'Faculty'
          }
        });
      } else if (roleEnum === 'TNP_ADMIN') {
        await tx.staffProfile.create({
          data: { 
            userId: user.id, 
            department: 'TNP Cell',
            designation: designation || 'T&P Officer'
          }
        });
      }
    });

    res.status(201).json({ message: 'Registration successful! Please wait for admin approval.' });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.status === 'PENDING') return res.status(403).json({ message: 'Account is pending admin approval.' });
    if (user.status === 'SUSPENDED') return res.status(403).json({ message: 'Account suspended. Contact administration.' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: 'Server error during login' });
  }
};