import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Lock, Mail, CheckCircle, XCircle, LogOut, 
  X, ShieldCheck, Search, RotateCcw, AlertTriangle, 
  GraduationCap, Briefcase, Activity
} from 'lucide-react';

export default function SuperAdminStaff() {
  const navigate = useNavigate();
  
  // UI State
  const [activeTab, setActiveTab] = useState('teachers'); // 'teachers' or 'tnp'
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- MOCK DATA ---
  const [teachers, setTeachers] = useState([
    { id: 1, name: "Dr. A.K. Singh", dept: "Computer Science", email: "ak.singh@college.edu", status: "Pending" },
    { id: 2, name: "Prof. Neha Gupta", dept: "Information Tech", email: "neha.g@college.edu", status: "Active" },
    { id: 3, name: "Dr. R.K. Sharma", dept: "Computer Science", email: "rk.sharma@college.edu", status: "Active" }
  ]);

  const [tnpOfficers, setTnpOfficers] = useState([
    { id: 4, name: "Ms. Kavita Rao", dept: "Placement Cell", email: "kavita.r@college.edu", status: "Pending" },
    { id: 5, name: "Mr. Vivek Mehta", dept: "Placement Cell", email: "vivek.m@college.edu", status: "Active" }
  ]);

  // --- HANDLERS ---
  const handleApprove = (id, type) => {
    if (type === 'teacher') {
      setTeachers(teachers.map(t => t.id === id ? { ...t, status: "Active" } : t));
    } else {
      setTnpOfficers(tnpOfficers.map(t => t.id === id ? { ...t, status: "Active" } : t));
    }
  };

  const handleReject = (id, type) => {
    if(window.confirm("Are you sure you want to reject this staff registration request?")) {
      if (type === 'teacher') {
        setTeachers(teachers.filter(t => t.id !== id));
      } else {
        setTnpOfficers(tnpOfficers.filter(t => t.id !== id));
      }
    }
  };

  const handleResetPassword = (name) => {
    if(window.confirm(`Reset password to "password" for ${name}?`)) {
      alert(`Password for ${name} has been reset to "password".`);
    }
  };

  const handleBulkReset = (role) => {
    if(window.confirm(`WARNING: Are you sure you want to reset ALL ${role} passwords to 'password'? This action cannot be undone.`)) {
      alert(`All ${role} passwords have been successfully reset to 'password'.`);
    }
  };

  const handleLogout = () => navigate('/');

  // --- FILTER LOGIC ---
  const activeData = activeTab === 'teachers' ? teachers : tnpOfficers;
  
  const filteredData = useMemo(() => {
    return activeData.filter(staff => 
      staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeData, searchQuery]);

  // Separate pending and active for a clean UI view
  const pendingStaff = filteredData.filter(s => s.status === 'Pending');
  const activeStaff = filteredData.filter(s => s.status === 'Active');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* --- TOP NAVBAR --- */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-700 rounded-md flex items-center justify-center">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                S.C.O.P.E. <span className="text-emerald-600">Core Admin</span>
              </h1>
            </div>

            <div className="flex items-center gap-6">
              {/* Link to System Analysis */}
              <button 
                onClick={() => navigate('/admin/system')} 
                className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 transition-colors"
              >
                <Activity size={16}/> Go to System Analysis
              </button>

              <button 
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-900 leading-tight">Super Admin</p>
                  <p className="text-xs text-slate-500 font-medium">System Root</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800">
                  <User size={20} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-fit border border-slate-200">
            <button
              onClick={() => setActiveTab('teachers')}
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'teachers' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <GraduationCap size={16} /> Teachers Directory
            </button>
            <button
              onClick={() => setActiveTab('tnp')}
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'tnp' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Briefcase size={16} /> T&P Officers
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input 
              type="text" placeholder="Search staff by name or email..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm shadow-sm"
            />
          </div>
        </div>

        {/* --- PENDING APPROVALS SECTION --- */}
        {pendingStaff.length > 0 && (
          <div className="bg-white border border-amber-200 rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="p-4 border-b border-amber-100 bg-amber-50 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-amber-900">Pending {activeTab === 'teachers' ? 'Teacher' : 'T&P'} Approvals</h2>
                <p className="text-xs text-amber-700">Review requests before granting platform access.</p>
              </div>
              <span className="bg-amber-200 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">{pendingStaff.length} Pending</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Name & Email</th>
                    <th className="px-6 py-3">Department</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingStaff.map(staff => (
                    <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-bold text-slate-900">{staff.name} <br/><span className="text-xs font-normal text-slate-500">{staff.email}</span></td>
                      <td className="px-6 py-3 text-slate-600">{staff.dept}</td>
                      <td className="px-6 py-3 text-right flex justify-end gap-2">
                        <button onClick={() => handleReject(staff.id, activeTab)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <XCircle size={18} />
                        </button>
                        <button onClick={() => handleApprove(staff.id, activeTab)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg transition-colors text-xs">
                          <CheckCircle size={14} /> Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- ACTIVE DIRECTORY SECTION --- */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Active {activeTab === 'teachers' ? 'Teachers' : 'T&P Officers'}</h2>
              <p className="text-sm text-slate-500">Manage credentials for approved personnel.</p>
            </div>
            <button 
              onClick={() => handleBulkReset(activeTab === 'teachers' ? 'Teacher' : 'T&P Officer')}
              className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 py-2 px-4 rounded-lg transition-colors"
            >
              <AlertTriangle size={16} /> Reset ALL to "password"
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Name & Email</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Security Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeStaff.length > 0 ? (
                  activeStaff.map(staff => (
                    <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{staff.name}</p>
                        <p className="text-xs text-slate-500">{staff.email}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{staff.dept}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md text-xs font-bold border border-emerald-200">Active</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleResetPassword(staff.name)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold rounded-lg transition-colors text-xs"
                        >
                          <RotateCcw size={14} /> Reset Password
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-medium">No active staff found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* --- SECURE PROFILE SETTINGS MODAL --- */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)}></div>
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Admin Settings</h2>
              <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Root Profile</p>
                <p className="font-bold text-slate-900">Super Admin</p>
                <p className="text-sm text-slate-600">S.C.O.P.E. Core Maintainer</p>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Update Root Credentials</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input type="password" placeholder="Enter current password" className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input type="password" placeholder="Create a new strong password" className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-bold transition-colors">
                <LogOut size={16} /> Sign Out
              </button>
              <button onClick={() => setIsProfileOpen(false)} className="bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-all shadow-sm">
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}