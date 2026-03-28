import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Lock, Mail, CheckCircle, XCircle, LogOut, 
  X, ShieldCheck, Search, RotateCcw, AlertTriangle, 
  Users, Key, Copy, CalendarClock, UploadCloud, FileText
} from 'lucide-react';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  
  // --- UI STATE ---
  const [activeTab, setActiveTab] = useState('pending'); 
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // --- DYNAMIC DATA STATE ---
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedStudents, setApprovedStudents] = useState([]);
  
  // ==========================================
  // 🚀 DATA FETCHING: Load from PostgreSQL
  // ==========================================
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const pendingRes = await fetch('http://localhost:5000/api/teacher/students/pending', { headers });
      const pendingData = await pendingRes.json();
      if (pendingRes.ok) {
        setPendingRequests(pendingData);
      } else {
        alert(`Pending Error: ${pendingData.message || pendingData.error}`);
      }

      const activeRes = await fetch('http://localhost:5000/api/teacher/students/active', { headers });
      const activeData = await activeRes.json();
      if (activeRes.ok) {
        setApprovedStudents(activeData);
      } else {
        alert(`Directory Error: ${activeData.message || activeData.error}`);
      }
    } catch (error) {
      console.error("Fetch Data Error:", error); 
      alert("Failed to load student data. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ==========================================
  // ⚡ ACTION HANDLERS
  // ==========================================
  const handleApprove = async (student) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/teacher/students/approve/${student.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setPendingRequests(pendingRequests.filter(req => req.id !== student.id));
        setApprovedStudents([...approvedStudents, { ...student, status: 'ACTIVE' }]);
        alert(`${student.name} has been approved.`);
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Approval Error:", error); 
      alert("Failed to connect to the server.");
    }
  };

  const handleReject = async (id) => {
    if(!window.confirm("Are you sure you want to reject and delete this registration?")) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/teacher/students/reject/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setPendingRequests(pendingRequests.filter(req => req.id !== id));
      } else {
        // 🛡️ FIX: Added error alert to prevent silent failure
        const data = await response.json();
        alert(`Failed: ${data.message || 'Could not reject student.'}`);
      }
    } catch (error) {
      console.error("Rejection Error:", error); 
      alert("Failed to connect to the server.");
    }
  };

  const handleResetPassword = async (student) => {
    if(!window.confirm(`Reset password to "password" for ${student.name}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/teacher/students/reset-password`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: student.id })
      });

      if (response.ok) {
        alert(`Password for ${student.name} has been reset to "password".`);
      } else {
        // 🛡️ FIX: Added error alert to prevent silent failure
        const data = await response.json();
        alert(`Failed: ${data.message || 'Could not reset password.'}`);
      }
    } catch (error) {
      console.error("Reset Password Error:", error); 
      alert("Failed to reset password. Network error.");
    }
  };

  const handleBulkReset = async () => {
    if(!window.confirm("WARNING: Reset ALL student passwords in your scope to 'password'?")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/teacher/students/bulk-reset`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
      } else {
        alert(`Failed: ${data.message || data.error}`);
      }
    } catch (error) {
      console.error("Bulk Reset Error:", error); 
      alert("Failed to execute bulk reset. Network error.");
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/teacher/students/bulk-upload', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        let msg = data.message;
        if (data.errors && data.errors.length > 0) {
          msg += `\n\nError Log:\n${data.errors.slice(0, 5).join('\n')}`;
          if (data.errors.length > 5) msg += `\n...and ${data.errors.length - 5} more.`;
        } else {
          msg += `\n\nStudents have been added directly to the Active Directory.`;
        }
        alert(msg);
        fetchStudents(); 
      } else {
        alert(`Upload Failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Bulk Upload Error:", error);
      alert("Failed to connect to the server for bulk upload.");
    } finally {
      setLoading(false);
      e.target.value = null; 
    }
  };

  const showCsvFormat = () => {
    alert("Required CSV Headers:\n\nname, email, password, branch, year, division, batch, rollNo, tnpRollNo\n\nExample Data Row:\nAarav Sharma, aarav@college.edu, strongpass123, CSE, 3, A, 2025, 21CSE1001, TNP001");
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('scope_user');
    navigate('/');
  };

  const filteredAndSortedStudents = useMemo(() => {
    let filtered = approvedStudents.filter(student => 
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentProfile?.rollNo.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return filtered.sort((a, b) => (a.studentProfile?.rollNo || "").localeCompare(b.studentProfile?.rollNo || ""));
  }, [approvedStudents, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
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
              <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-900">
                <User size={20} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
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

        {loading ? (
          <div className="text-center p-12 text-slate-500 font-bold animate-pulse">Syncing with Secure Database...</div>
        ) : (
          <>
            {activeTab === 'pending' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Registration Requests</h2>
                    <p className="text-sm text-slate-500 mt-1">Review and approve students or upload a batch via CSV.</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5">
                    <label className="cursor-pointer bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold py-2.5 px-5 rounded-lg shadow-sm flex items-center gap-2 transition-colors">
                      <UploadCloud size={16} /> Bulk Upload (CSV)
                      <input type="file" accept=".csv" className="hidden" onChange={handleBulkUpload} />
                    </label>
                    <button onClick={showCsvFormat} className="text-[10px] font-bold text-slate-400 hover:text-blue-600 flex items-center gap-1 uppercase tracking-wider mr-1 transition-colors">
                      <FileText size={12} /> View CSV Format
                    </button>
                  </div>
                </div>
                
                {pendingRequests.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 font-medium">No pending registration requests in your scope.</div>
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
                            <td className="px-6 py-4 font-mono text-slate-600">{student.studentProfile?.rollNo}</td>
                            <td className="px-6 py-4 text-slate-600">{student.studentProfile?.branch} <br/><span className="text-xs text-slate-400">{student.studentProfile?.batch}</span></td>
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
                            <td className="px-6 py-4 font-mono font-bold text-blue-900">{student.studentProfile?.rollNo}</td>
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{student.name}</p>
                              <p className="text-xs text-slate-500">{student.email}</p>
                            </td>
                            <td className="px-6 py-4 text-slate-600">{student.studentProfile?.branch}</td>
                            <td className="px-6 py-4 text-right">
                              <button onClick={() => handleResetPassword(student)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold rounded-lg transition-colors text-xs">
                                <RotateCcw size={14} /> Reset Password
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-medium">No active students found in your scope.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'tests' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
                <div className="p-6 border-b border-slate-200 bg-slate-50">
                  <h2 className="text-lg font-bold text-slate-900">Test Access Credentials</h2>
                  <p className="text-sm text-slate-500">View and share Start/End passwords for ongoing exams.</p>
                </div>
                <div className="p-12 text-center text-slate-500">Test view integration coming in the next module.</div>
              </div>
            )}
          </>
        )}

      </main>

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