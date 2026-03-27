import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, GraduationCap, BookOpen, Building, Shield } from 'lucide-react';
// 1. Import the login service from your friend's auth module
import { loginUser } from '../../services/authService';

export default function Login() {
  const navigate = useNavigate();
  
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false); // Added loading state
  
  const [formData, setFormData] = useState({
    identifier: '', 
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 INTEGRATED BACKEND LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create payload matching your friend's backend expectations
      const payload = {
        email: formData.identifier, // Assuming backend uses email for login
        password: formData.password,
        role: role === 'tnp' ? 'TNP_ADMIN' : role === 'admin' ? 'SUPER_ADMIN' : role.toUpperCase()
      };

      // Call the API
      const response = await loginUser(payload);

      // 1. Save the JWT Token
      localStorage.setItem('token', response.token);
      
      // 2. Save the user details (useful for headers and protected routes)
      localStorage.setItem('scope_user', JSON.stringify(response.user));

      // 3. Navigate based on the REAL role returned by the database
      const userRole = response.user.role;
      switch(userRole) {
        case 'STUDENT': navigate('/dashboard'); break;
        case 'TEACHER': navigate('/teacher-dashboard'); break;
        case 'TNP_ADMIN': navigate('/tnp-dashboard'); break;
        case 'SUPER_ADMIN': navigate('/admin/system'); break;
        default: navigate('/');
      }

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Invalid credentials or unauthorized role.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getIdentifierLabel = () => {
    switch(role) {
      case 'student': return 'College Roll Number / Email';
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

        <div className="pt-10 pb-6 px-8 text-center border-b border-slate-100">
          <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
            S.C.O.P.E. Login
          </h1>
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
            Secure Platform Access
          </p>
        </div>

        <div className="p-8">
          
          <div className="grid grid-cols-4 gap-2 mb-8">
            <RoleButton currentRole={role} setRole={setRole} value="student" icon={<GraduationCap size={18} />} label="Student" />
            <RoleButton currentRole={role} setRole={setRole} value="teacher" icon={<BookOpen size={18} />} label="Faculty" />
            <RoleButton currentRole={role} setRole={setRole} value="tnp" icon={<Building size={18} />} label="TnP" />
            <RoleButton currentRole={role} setRole={setRole} value="admin" icon={<Shield size={18} />} label="Admin" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                {getIdentifierLabel()}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input 
                  type="text" 
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder-slate-400 shadow-sm text-sm ${loading ? 'bg-slate-50 opacity-60' : ''}`}
                  placeholder={`Enter your ${getIdentifierLabel().toLowerCase()}`} 
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Password
                </label>
                <a href="#" className="text-xs font-bold text-blue-900 hover:text-blue-700 transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading}
                  className={`w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder-slate-400 shadow-sm text-sm ${loading ? 'bg-slate-50 opacity-60' : ''}`}
                  placeholder="••••••••" 
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg mt-6 transition-all shadow-md active:scale-[0.98] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Authenticating...' : 'Secure Sign In'}
            </button>
            
            <div className="text-center pt-4">
              <span className="text-sm text-slate-500">New to S.C.O.P.E.? </span>
              <Link to="/register" className="text-sm font-bold text-blue-900 hover:text-blue-700 transition-colors">
                Create an Account
              </Link>
            </div>
          </form>

        </div>
      </div>
      
      <div className="absolute bottom-6 text-center w-full text-xs text-slate-500 font-medium">
        &copy; 2026 S.C.O.P.E. Engine. All institutional rights reserved.
      </div>
    </div>
  );
}

// Sub-components remain safely outside
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
      <div className="mb-1.5">{icon}</div>
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}