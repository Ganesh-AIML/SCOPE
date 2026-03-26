import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Lock, Mail, CheckCircle, XCircle, LogOut, 
  X, ShieldCheck, Search, RotateCcw, AlertTriangle, 
  Users, Key, Copy, CalendarClock
} from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  
  // UI State
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'directory', or 'tests'
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- MOCK DATA ---
  const [pendingRequests, setPendingRequests] = useState([
    { id: 1, name: "Vikram Singh", rollNo: "21BCE10500", branch: "Computer Science", batch: "2023-2027" },
    { id: 2, name: "Neha Gupta", rollNo: "21BCE10505", branch: "Information Technology", batch: "2023-2027" },
    { id: 3, name: "Arjun Reddy", rollNo: "21BCE10512", branch: "Computer Science", batch: "2023-2027" }
  ]);

  const [approvedStudents, setApprovedStudents] = useState([
    { id: 101, name: "Anuj Dev", rollNo: "21BCE10243", branch: "Computer Science", email: "anuj.dev@college.edu" },
    { id: 102, name: "Priya Sharma", rollNo: "21BCE10112", branch: "Computer Science", email: "priya.s@college.edu" },
    { id: 103, name: "Rahul Verma", rollNo: "21BCE10088", branch: "Information Technology", email: "rahul.v@college.edu" },
    { id: 104, name: "Sneha Patel", rollNo: "21BCE10301", branch: "Computer Science", email: "sneha.p@college.edu" }
  ]);

  // FIX: Removed unused setTestCredentials to make ESLint happy!
  const [testCredentials] = useState([
    { id: 1, title: "Placement Drive - Phase 1", status: "Live", date: "Today", startPassword: "PHASE1_START", endPassword: "PHASE1_END" },
    { id: 2, title: "Summer Internship Coding", status: "Upcoming", date: "Tomorrow", startPassword: "CODE_SUMMER_26", endPassword: "" },
    { id: 3, title: "TCS Ninja Mock Assessment", status: "Past", date: "Oct 12, 2026", startPassword: "TCS_MOCK_GO", endPassword: "TCS_MOCK_STOP" },
    { id: 4, title: "Core Java & DSA Screening", status: "Past", date: "Sep 28, 2026", startPassword: "", endPassword: "" }
  ]);

  // --- HANDLERS ---
  const handleApprove = (student) => {
    setPendingRequests(pendingRequests.filter(req => req.id !== student.id));
    setApprovedStudents([...approvedStudents, { ...student, email: `${student.name.split(' ')[0].toLowerCase()}@college.edu` }]);
    alert(`${student.name} has been approved and can now log in.`);
  };

  const handleReject = (id) => {
    if(window.confirm("Are you sure you want to reject this registration request?")) {
      setPendingRequests(pendingRequests.filter(req => req.id !== id));
    }
  };

  const handleResetPassword = (name) => {
    if(window.confirm(`Reset password to "password" for ${name}?`)) {
      alert(`Password for ${name} has been reset to "password".`);
    }
  };

  const handleBulkReset = () => {
    if(window.confirm("WARNING: Are you sure you want to reset ALL student passwords to 'password'? This action cannot be undone.")) {
      alert("All student passwords have been successfully reset to 'password'.");
    }
  };

  const handleCopyPassword = (password, type) => {
    if(!password) return;
    navigator.clipboard.writeText(password);
    alert(`${type} password copied to clipboard!`);
  };

  const handleLogout = () => navigate('/');

  // --- FILTER & SORT LOGIC ---
  const filteredAndSortedStudents = useMemo(() => {
    let filtered = approvedStudents.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
  }, [approvedStudents, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* --- TOP NAVBAR --- */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-900 rounded-md flex items-center justify-center">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                S.C.O.P.E. <span className="text-blue-900">Faculty</span>
              </h1>
            </div>

            <button 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">Dr. R.K. Sharma</p>
                <p className="text-xs text-slate-500 font-medium">Head of CS Dept.</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-900">
                <User size={20} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl w-fit mb-8 border border-slate-200 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('pending')}
            className={`whitespace-nowrap flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'pending' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Users size={16} /> Pending Approvals
            {pendingRequests.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-1">{pendingRequests.length}</span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('directory')}
            className={`whitespace-nowrap flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'directory' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <ShieldCheck size={16} /> Student Directory
          </button>
          <button
            onClick={() => setActiveTab('tests')}
            className={`whitespace-nowrap flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'tests' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Key size={16} /> Test Credentials
          </button>
        </div>

        {/* --- TAB 1: PENDING APPROVALS --- */}
        {activeTab === 'pending' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Registration Requests</h2>
              <p className="text-sm text-slate-500">Review and approve students to grant them platform access.</p>
            </div>
            
            {pendingRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">No pending registration requests.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Roll Number</th>
                      <th className="px-6 py-4">Branch & Batch</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingRequests.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{student.name}</td>
                        <td className="px-6 py-4 font-mono text-slate-600">{student.rollNo}</td>
                        <td className="px-6 py-4 text-slate-600">{student.branch} <br/><span className="text-xs text-slate-400">{student.batch}</span></td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                          <button onClick={() => handleReject(student.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <XCircle size={20} />
                          </button>
                          <button onClick={() => handleApprove(student)} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg transition-colors">
                            <CheckCircle size={16} /> Approve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: STUDENT DIRECTORY --- */}
        {activeTab === 'directory' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
            <div className="p-6 border-b border-slate-200 bg-slate-50 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Student Access Management</h2>
                  <p className="text-sm text-slate-500">Manage approved students and reset credentials.</p>
                </div>
                <div className="relative w-full md:w-72">
                  <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text" placeholder="Search by name or roll no..." value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 text-sm shadow-sm"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <button onClick={handleBulkReset} className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 py-2 px-4 rounded-lg transition-colors">
                  <AlertTriangle size={16} /> Reset ALL Passwords to "password"
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Roll Number</th>
                    <th className="px-6 py-4">Student Details</th>
                    <th className="px-6 py-4">Branch</th>
                    <th className="px-6 py-4 text-right">Security Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAndSortedStudents.length > 0 ? (
                    filteredAndSortedStudents.map(student => (
                      <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-blue-900">{student.rollNo}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{student.branch}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleResetPassword(student.name)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold rounded-lg transition-colors text-xs">
                            <RotateCcw size={14} /> Reset Password
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-medium">No students found matching your search.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 3: TEST CREDENTIALS --- */}
        {activeTab === 'tests' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
            
            <div className="p-6 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Test Access Credentials</h2>
              <p className="text-sm text-slate-500">View and share Start/End passwords for ongoing and scheduled exams.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Assessment Title</th>
                    <th className="px-6 py-4">Status & Date</th>
                    <th className="px-6 py-4">Start Password</th>
                    <th className="px-6 py-4">End Password</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {testCredentials.map(test => (
                    <tr key={test.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{test.title}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded w-fit text-[10px] font-bold uppercase tracking-wider ${
                            test.status === 'Live' ? 'bg-red-100 text-red-700 border border-red-200' :
                            test.status === 'Upcoming' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {test.status === 'Live' && <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse mr-1.5"></div>}
                            {test.status}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                            <CalendarClock size={12} /> {test.date}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {test.startPassword ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-1 rounded select-all">{test.startPassword}</span>
                            <button onClick={() => handleCopyPassword(test.startPassword, "Start")} className="text-slate-400 hover:text-blue-600 transition-colors"><Copy size={14}/></button>
                          </div>
                        ) : <span className="text-slate-400 italic text-xs">No Password Set</span>}
                      </td>
                      <td className="px-6 py-4">
                        {test.endPassword ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-1 rounded select-all">{test.endPassword}</span>
                            <button onClick={() => handleCopyPassword(test.endPassword, "End")} className="text-slate-400 hover:text-blue-600 transition-colors"><Copy size={14}/></button>
                          </div>
                        ) : <span className="text-slate-400 italic text-xs">No Password Set</span>}
                      </td>
                    </tr>
                  ))}
                  {testCredentials.length === 0 && (
                    <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-medium">No tests configured.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>

      {/* --- SECURE PROFILE SETTINGS MODAL --- */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)}></div>
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Faculty Settings</h2>
              <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Faculty Profile</p>
                <p className="font-bold text-slate-900">Dr. R.K. Sharma</p>
                <p className="text-sm text-slate-600">Head of Computer Science Dept.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 flex justify-between">
                  Institutional Email Address
                  <span className="text-[10px] text-red-500 font-bold tracking-normal">Contact Super Admin to Change</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="email" defaultValue="rk.sharma@college.edu" disabled
                    className="w-full bg-slate-100 border border-slate-200 text-slate-500 rounded-lg pl-10 pr-4 py-2.5 cursor-not-allowed focus:outline-none text-sm font-medium" 
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Update Security Credentials</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input type="password" placeholder="Enter current password" className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input type="password" placeholder="Create a new strong password" className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 text-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm font-bold transition-colors">
                <LogOut size={16} /> Sign Out
              </button>
              <button onClick={() => setIsProfileOpen(false)} className="bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold py-2.5 px-6 rounded-lg transition-all shadow-sm">
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}