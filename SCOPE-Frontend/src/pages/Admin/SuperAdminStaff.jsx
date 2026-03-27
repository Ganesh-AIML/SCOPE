import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Lock, Mail, CheckCircle, XCircle, LogOut, 
  X, ShieldCheck, Search, RotateCcw, AlertTriangle, 
  GraduationCap, Briefcase, Activity
} from 'lucide-react';

export default function SuperAdminStaff() {
  const navigate = useNavigate();
  
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('teachers'); // 'teachers' or 'tnp'
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // --- DYNAMIC DATA STATE ---
  const [staffList, setStaffList] = useState([]);

  // ==========================================
  // 🚀 DATA FETCHING: Load from PostgreSQL
  // ==========================================
  const fetchStaffDirectory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/admin/users/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Filter out STUDENTS and SUPER_ADMINS, we only want TEACHER and TNP_ADMIN
        const filteredStaff = data.filter(u => u.role === 'TEACHER' || u.role === 'TNP_ADMIN');
        setStaffList(filteredStaff);
      } else {
        alert(`Error loading staff: ${data.message || data.error}`);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Failed to load staff directory. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffDirectory();
  }, []);

  // ==========================================
  // ⚡ ACTION HANDLERS
  // ==========================================
  const handleApprove = async (id, name) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/approve/${id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setStaffList(prev => prev.map(staff => staff.id === id ? { ...staff, status: 'ACTIVE' } : staff));
        alert(`${name} has been approved and activated.`);
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Approval Error:", error);
      alert("Failed to connect to the server.");
    }
  };

  const handleReject = async (id, name) => {
    if(!window.confirm(`Are you sure you want to permanently delete ${name}'s account?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setStaffList(prev => prev.filter(staff => staff.id !== id));
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Deletion Error:", error);
      alert("Failed to connect to the server.");
    }
  };

  const handleResetPassword = async (id, name) => {
    if(!window.confirm(`Reset password to "password" for ${name}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/reset-password`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      });

      if (response.ok) {
        alert(`Password for ${name} has been reset to "password".`);
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Reset Error:", error);
      alert("Failed to reset password.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('scope_user');
    navigate('/');
  };

  // --- FILTER & SORT LOGIC ---
  const currentCategoryList = useMemo(() => {
    const roleFilter = activeTab === 'teachers' ? 'TEACHER' : 'TNP_ADMIN';
    let filtered = staffList.filter(staff => staff.role === roleFilter);
    
    if (searchQuery) {
      filtered = filtered.filter(staff => 
        staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (staff.staffProfile?.department || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort PENDING to the top, then alphabetically
    return filtered.sort((a, b) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
      return a.name.localeCompare(b.name);
    });
  }, [staffList, activeTab, searchQuery]);

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
                S.C.O.P.E. <span className="text-emerald-700">Super Admin</span>
              </h1>
            </div>

            <button 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="h-10 w-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800">
                <User size={20} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 flex-wrap sm:flex-nowrap bg-slate-200/50 p-1 rounded-xl w-fit mb-8 border border-slate-200 overflow-x-auto max-w-full">
          {/* FIX 2: Added Back Button */}
          <button
            onClick={() => navigate(-1)} 
            className="whitespace-nowrap flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-all text-slate-600 hover:text-slate-900 hover:bg-white/50"
          >
            <Activity size={16} /> ← System Analysis
          </button>
          <div className="w-px bg-slate-300 my-1 mx-1 hidden sm:block"></div>
          
          <button
            onClick={() => setActiveTab('teachers')}
            className={`whitespace-nowrap flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'teachers' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <GraduationCap size={16} /> Faculty Management
          </button>
          <button
            onClick={() => setActiveTab('tnp')}
            className={`whitespace-nowrap flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'tnp' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Briefcase size={16} /> T&P Admins
          </button>
        </div>

        {/* Directory Container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="p-6 border-b border-slate-200 bg-slate-50 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {activeTab === 'teachers' ? 'Department Faculty' : 'Training & Placement Officers'}
                </h2>
                <p className="text-sm text-slate-500">Approve new registrations and manage credentials.</p>
              </div>
              <div className="relative w-full md:w-72">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" placeholder="Search by name, email, or dept..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm shadow-sm"
                />
              </div>
            </div>
          </div>

          {loading ? (
             <div className="text-center p-12 text-slate-500 font-bold animate-pulse">Syncing with Secure Database...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-4 w-1/3">Profile Details</th>
                    <th className="px-6 py-4">Department / Designation</th>
                    <th className="px-6 py-4 text-center">System Status</th>
                    <th className="px-6 py-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentCategoryList.length > 0 ? (
                    currentCategoryList.map(staff => (
                      <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{staff.name}</p>
                          <p className="text-xs text-slate-500">{staff.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-700">{staff.staffProfile?.department || 'N/A'}</p>
                          <p className="text-xs text-slate-500">{staff.staffProfile?.designation || 'Staff Member'}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {staff.status === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <AlertTriangle size={12} /> Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle size={12} /> Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {staff.status === 'PENDING' && (
                              <button 
                                onClick={() => handleApprove(staff.id, staff.name)} 
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-xs"
                              >
                                Approve
                              </button>
                            )}
                            <button 
                              onClick={() => handleResetPassword(staff.id, staff.name)} 
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                              title="Reset Password"
                            >
                              <RotateCcw size={16} />
                            </button>
                            <button 
                              onClick={() => handleReject(staff.id, staff.name)} 
                              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                              title="Delete User"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="p-12 text-center text-slate-500 font-medium">No staff members found in this category.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* --- SECURE PROFILE SETTINGS MODAL --- */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)}></div>
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">System Settings</h2>
              <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-bold transition-colors">
                <LogOut size={16} /> Sign Out Securely
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}