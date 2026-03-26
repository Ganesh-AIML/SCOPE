import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, GraduationCap, BookOpen, Building, Shield } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  
  const [role, setRole] = useState('student');
  
  const [formData, setFormData] = useState({
    identifier: '', 
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    switch(role) {
      case 'student': navigate('/dashboard'); break;
      case 'teacher': navigate('/teacher-dashboard'); break;
      case 'tnp': navigate('/tnp-dashboard'); break;
      case 'admin': navigate('/admin'); break; // <-- FIX: Changed from /super-admin to /admin
      default: navigate('/');
    }
  };

  const getIdentifierLabel = () => {
    switch(role) {
      case 'student': return 'College Roll Number';
      case 'teacher': return 'Institutional Email';
      case 'tnp': return 'TnP Department Email';
      case 'admin': return 'Super Admin ID';
      default: return 'Email / ID';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans text-slate-900 p-4">
      
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-900"></div>

        <div className="pt-10 pb-6 px-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">
            <span className="text-blue-900">S.C.O.P.E.</span>
          </h1>
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
            Secure Exam Platform
          </p>
        </div>

        <div className="px-8 pb-8">
          
          <div className="flex bg-slate-100 rounded-lg p-1 mb-8 border border-slate-200">
            <button 
              className="flex-1 py-2 text-sm font-semibold rounded-md transition-all bg-white text-blue-900 shadow-sm border border-slate-200/50"
            >
              Sign In
            </button>
            <Link 
              to="/register" 
              className="flex-1 py-2 text-sm font-semibold rounded-md transition-all text-slate-500 hover:text-slate-700 flex items-center justify-center"
            >
              Register
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            <RoleButton currentRole={role} setRole={setRole} value="student" icon={<GraduationCap size={20} />} label="Student" />
            <RoleButton currentRole={role} setRole={setRole} value="teacher" icon={<BookOpen size={20} />} label="Teacher" />
            <RoleButton currentRole={role} setRole={setRole} value="tnp" icon={<Building size={20} />} label="TnP Admin" />
            <RoleButton currentRole={role} setRole={setRole} value="admin" icon={<Shield size={20} />} label="Super Admin" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">{getIdentifierLabel()}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  {role === 'student' ? <User size={18} /> : <Mail size={18} />}
                </div>
                <input 
                  type={role === 'student' || role === 'admin' ? 'text' : 'email'} 
                  name="identifier" value={formData.identifier} onChange={handleInputChange}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder-slate-400 shadow-sm"
                  placeholder={`Enter your ${getIdentifierLabel().toLowerCase()}`} required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Lock size={18} /></div>
                <input 
                  type="password" name="password" value={formData.password} onChange={handleInputChange}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder-slate-400 shadow-sm"
                  placeholder="••••••••" required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg mt-6 transition-all shadow-md active:scale-[0.98]"
            >
              Secure Sign In
            </button>
          </form>

        </div>
      </div>
      
      <div className="absolute bottom-6 text-center w-full text-xs text-slate-500 font-medium">
        &copy; 2026 S.C.O.P.E. Engine. All institutional rights reserved.
      </div>
    </div>
  );
}

function RoleButton({ currentRole, setRole, value, icon, label }) {
  const isSelected = currentRole === value;
  return (
    <button
      type="button"
      onClick={() => setRole(value)}
      className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all duration-200 
        ${isSelected 
          ? 'border-blue-900 bg-blue-50 text-blue-900 shadow-sm' 
          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700'}`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}