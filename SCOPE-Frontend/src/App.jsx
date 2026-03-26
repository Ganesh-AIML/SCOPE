import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- LAZY IMPORTS ---
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Dashboard = lazy(() => import('./pages/Student/Dashboard'));
const ExamWorkspace = lazy(() => import('./pages/Exam/Workspace'));
const AnalysisBoard = lazy(() => import('./pages/Exam/AnalysisBoard'));
const TeacherDashboard = lazy(() => import('./pages/Teacher/TeacherDashboard'));
const TnpDashboard = lazy(() => import('./pages/Teacher/TnpDashboard'));

// --- SUPER ADMIN IMPORTS ---
const SuperAdminSystem = lazy(() => import('./pages/Admin/SuperAdminSystem'));
const SuperAdminStaff = lazy(() => import('./pages/Admin/SuperAdminStaff'));

function App() {
  return (
    <Router>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm font-medium">Loading S.C.O.P.E....</div>}>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Student Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exam/:examId" element={<ExamWorkspace />} /> 
          <Route path="/analysis/:examId" element={<AnalysisBoard />} />

          {/* Teacher / T&P Routes */}
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/tnp-dashboard" element={<TnpDashboard />} />
          
          {/* Super Admin Routes */}
          <Route path="/admin/system" element={<SuperAdminSystem />} />
          <Route path="/admin/staff" element={<SuperAdminStaff />} />
          
          {/* This handles the redirect from Login */}
          <Route path="/admin" element={<Navigate to="/admin/system" replace />} />
          
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
