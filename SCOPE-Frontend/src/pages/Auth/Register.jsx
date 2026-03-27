import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Lock, Mail, GraduationCap, BookOpen, Building, Shield, 
  Hash, Calendar, Layers, MapPin, Briefcase 
} from 'lucide-react';
// Import the registration service from your friend's auth module
import { registerUser } from '../../services/authService';

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState('student'); 
  const [loading, setLoading] = useState(false); // Added loading state
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    branch: '',
    div: '',
    rollNo: '',
    batch: '', 
    year: '',
    tnpRollNo: '',
    designation: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 INTEGRATED BACKEND LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: role === 'tnp' ? 'TNP_ADMIN' : role === 'admin' ? 'SUPER_ADMIN' : role.toUpperCase(),
        department: formData.branch || formData.designation, 
        division: formData.div,                              
        batch: formData.batch,
        year: formData.year,
        rollNo: formData.rollNo,
        tnpRollNo: formData.tnpRollNo,
        designation: formData.designation
      };

      // Send data to the backend API
      await registerUser(payload);

      alert("Registration Request Sent! Please wait for admin approval if you are a student.");
      navigate('/'); 

    } catch (error) {
      const errorMsg = error.response?.data?.message || "Registration failed. Please check your details.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans text-slate-900 p-4 py-10">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden relative">
        
        <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-900"></div>

        <div className="pt-10 pb-6 px-8 text-center border-b border-slate-100">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
            Create Institutional Account
          </h1>
          <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
            S.C.O.P.E. Secure Platform
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <RoleButton currentRole={role} setRole={setRole} value="student" icon={<GraduationCap size={18} />} label="Student" />
            <RoleButton currentRole={role} setRole={setRole} value="teacher" icon={<BookOpen size={18} />} label="Teacher" />
            <RoleButton currentRole={role} setRole={setRole} value="tnp" icon={<Building size={18} />} label="TnP Admin" />
            <RoleButton currentRole={role} setRole={setRole} value="admin" icon={<Shield size={18} />} label="Super Admin" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              
              <FormInput label="Full Name" name="fullName" icon={User} placeholder="John Doe" colSpan={2} value={formData.fullName} onChange={handleInputChange} disabled={loading} />
              <FormInput label="Email Address" name="email" type="email" icon={Mail} placeholder="john.doe@college.edu" value={formData.email} onChange={handleInputChange} disabled={loading} />
              <FormInput label="Password" name="password" type="password" icon={Lock} placeholder="••••••••" value={formData.password} onChange={handleInputChange} disabled={loading} />

              {role === 'student' && (
                <>
                  <FormInput label="Branch" name="branch" icon={Layers} placeholder="e.g., Computer Science" value={formData.branch} onChange={handleInputChange} disabled={loading} />
                  <FormInput label="Year" name="year" icon={Calendar} placeholder="e.g., 3rd Year" value={formData.year} onChange={handleInputChange} disabled={loading} />
                  <FormInput label="Division (Div)" name="div" icon={MapPin} placeholder="e.g., A, B, C" value={formData.div} onChange={handleInputChange} disabled={loading} />
                  <FormInput label="Batch Of" name="batch" icon={Calendar} placeholder="e.g., 2023 - 2027" value={formData.batch} onChange={handleInputChange} disabled={loading} />
                  <FormInput label="College Roll No." name="rollNo" icon={Hash} placeholder="e.g., 21BCE10243" value={formData.rollNo} onChange={handleInputChange} disabled={loading} />
                  <FormInput label="TnP Roll No." name="tnpRollNo" icon={Briefcase} placeholder="e.g., TNP-1024" value={formData.tnpRollNo} onChange={handleInputChange} disabled={loading} />
                </>
              )}

              {role === 'teacher' && (
                <>
                  <FormInput label="Branch / Department" name="branch" icon={Layers} placeholder="e.g., Information Technology" value={formData.branch} onChange={handleInputChange} disabled={loading} />
                  <FormInput label="Designation" name="designation" icon={Briefcase} placeholder="e.g., Assistant Professor" value={formData.designation} onChange={handleInputChange} disabled={loading} />
                </>
              )}

              {(role === 'admin' || role === 'tnp') && (
                <>
                  <FormInput label="Designation / Role" name="designation" icon={Briefcase} placeholder="e.g., System Administrator" colSpan={2} value={formData.designation} onChange={handleInputChange} disabled={loading} />
                </>
              )}

            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md active:scale-[0.98] mb-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing Request...' : `Register ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
              </button>
              
              <div className="text-center">
                <span className="text-sm text-slate-500">Already have an account? </span>
                <Link to="/" className="text-sm font-bold text-blue-900 hover:text-blue-700 transition-colors">
                  Sign In here
                </Link>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function FormInput({ label, name, type = "text", icon: Icon, placeholder, colSpan = 1, value, onChange, disabled }) {
  return (
    <div className={colSpan === 2 ? "md:col-span-2" : "col-span-1"}>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon size={16} />
          </div>
        )}
        <input 
          type={type} 
          name={name} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          required
          disabled={disabled}
          className={`w-full bg-white border border-slate-300 text-slate-900 rounded-lg pr-4 py-2.5 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all placeholder-slate-400 shadow-sm text-sm ${Icon ? 'pl-10' : 'pl-4'} ${disabled ? 'bg-slate-50 opacity-60' : ''}`}
        />
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
      className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all duration-200 
        ${isSelected 
          ? 'border-blue-900 bg-blue-50 text-blue-900 shadow-sm' 
          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700'}`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}