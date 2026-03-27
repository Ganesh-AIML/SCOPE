const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');

exports.register = async (req, res) => {
  try {
    const { 
      name, email, password, role, department, 
      division, batch, year, rollNo, tnpRollNo, designation 
    } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const roleEnum = role === 'tnp' ? 'TNP_ADMIN' : role === 'admin' ? 'SUPER_ADMIN' : role.toUpperCase();

    const userData = {
      name,
      email,
      passwordHash,
      role: roleEnum,
      status: roleEnum === 'STUDENT' ? 'PENDING' : 'ACTIVE',
    };

    if (roleEnum === 'STUDENT') {
      userData.studentProfile = {
        create: { rollNo, tnpRollNo, branch: department, batch, division, year }
      };
    } else {
      userData.staffProfile = {
        create: { department, designation }
      };
    }

    // COMPLETED THE MISSING TRANSACTION LOGIC HERE
    const newUser = await prisma.user.create({
      data: userData,
      include: { studentProfile: true, staffProfile: true }
    });

    res.status(201).json({ message: "Registration successful", user: newUser });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; 

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (user.status === 'PENDING') return res.status(403).json({ message: 'Account pending admin approval' });
    if (user.status === 'SUSPENDED') return res.status(403).json({ message: 'Account is suspended' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'scope_secure_jwt_key',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};