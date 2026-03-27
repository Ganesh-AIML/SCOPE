require('dotenv').config();

// ✅ CRITICAL SECURITY CHECK
if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL ERROR: JWT_SECRET is not defined in .env file.');
  process.exit(1); // Stop the server immediately
}

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

app.use(cors()); 
app.use(express.json()); 

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  console.log(`⚡ A user connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`🔌 A user disconnected: ${socket.id}`));
});

// --- ROUTES INCORPORATED INTO YOUR STRUCTURE ---
const authRoutes = require('./src/modules/auth/auth.routes');
const tnpRoutes = require('./src/modules/tnp/tnp.routes');
const studentRoutes = require('./src/modules/student/student.routes');
const teacherRoutes = require('./src/modules/teacher/teacher.routes'); 
const adminRoutes = require('./src/modules/admin/admin.routes');       

app.use('/api/auth', authRoutes);
app.use('/api/tnp', tnpRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'S.C.O.P.E. Backend is Live! 🚀' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 S.C.O.P.E. Server running on port ${PORT}`);
  console.log(`=========================================`);
});