import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Lock, Mail, Clock, Calendar, CheckCircle, 
  XCircle, PlayCircle, LogOut, X, Activity, BookOpen, KeyRound
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // --- REAL DATA STATE ---
  const [liveExams, setLiveExams] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [pastExams, setPastExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 🚀 BACKEND SYNC: Fetch Tests from PostgreSQL ---
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/student/available-tests');
        const result = await response.json();
        
        if (result.success) {
          const now = new Date();
          
          // Filter Live vs Upcoming based on the current date/time
          const live = result.data.filter(test => new Date(test.date) <= now);
          const upcoming = result.data.filter(test => new Date(test.date) > now);

          setLiveExams(live);
          setUpcomingExams(upcoming);
          
          // Past exams can be initialized as empty until results module is linked
          setPastExams([]); 
        }
      } catch (error) {
        console.error("Error loading student dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">Loading your assessments...</div>;

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* --- TOP NAVBAR --- */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-900 rounded-md flex items-center justify-center">
                <Activity size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                S.C.O.P.E. <span className="text-blue-900">Student</span>
              </h1>
            </div>

            <button 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-slate-900 leading-tight">Anuj (21BCE10243)</p>
                <p className="text-xs text-slate-500 font-medium">Computer Science</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-900">
                <User size={20} />
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-10">
        
        {/* 1. LIVE EXAMS */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></div>
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Live Examinations</h2>
          </div>
          
          {liveExams.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {liveExams.map(exam => (
                <div key={exam.id} className="bg-white border-2 border-blue-900 rounded-xl p-6 shadow-lg shadow-blue-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{exam.title}</h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
                      <span className="flex items-center gap-1.5"><Clock size={16} className="text-blue-900"/> {exam.duration} Minutes</span>
                      <span className="flex items-center gap-1.5"><BookOpen size={16} className="text-blue-900"/> Exam ID: {exam.id.slice(-5)}</span>
                      <span className="px-2.5 py-1 bg-slate-100 rounded-md text-xs font-bold uppercase tracking-wider">Attempt: 1</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate(`/exam/${exam.id}`)}
                    className="flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg transition-all active:scale-95 shadow-md whitespace-nowrap z-10"
                  >
                    <PlayCircle size={20} /> Enter Exam Environment
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
              No live exams at the moment.
            </div>
          )}
        </section>

        {/* 2. UPCOMING EXAMS */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide mb-4">Upcoming Schedule</h2>
          {upcomingExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingExams.map(exam => (
                <div key={exam.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-slate-900 mb-3">{exam.title}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span className="flex items-center gap-2"><Calendar size={16} className="text-slate-400"/> {new Date(exam.date).toLocaleDateString()}</span>
                      <span className="font-semibold text-slate-800">{new Date(exam.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <span className="flex items-center gap-2"><Clock size={16} className="text-slate-400"/> {exam.duration} Mins</span>
                      <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded">Scheduled</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-slate-400 text-sm italic">No upcoming assessments scheduled.</div>
          )}
        </section>

        {/* 3. PAST EXAMS */}
        <section>
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide mb-4">Past Results</h2>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Examination Title</th>
                    <th className="px-6 py-4">Date Taken</th>
                    <th className="px-6 py-4">Score</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pastExams.length > 0 ? pastExams.map(exam => (
                    <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{exam.title}</td>
                      <td className="px-6 py-4 text-slate-600">{exam.date}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{exam.score}</td>
                      <td className="px-6 py-4 text-right">
                        {exam.status === 'Passed' 
                          ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800"><CheckCircle size={14}/> {exam.status}</span>
                          : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800"><XCircle size={14}/> {exam.status}</span>
                        }
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-slate-400">No past assessment records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      {/* --- SECURE PROFILE SETTINGS MODAL --- */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsProfileOpen(false)}></div>
          
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Account Settings</h2>
              <button onClick={() => setIsProfileOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Student Profile</p>
                <p className="font-bold text-slate-900">Anuj (21BCE10243)</p>
                <p className="text-sm text-slate-600">Computer Science • Batch of 2023-2027</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5 flex justify-between">
                  Registered Email Address
                  <span className="text-[10px] text-red-500 font-bold tracking-normal">Contact Admin to Change</span>
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="email" 
                    defaultValue="anuj.dev@college.edu" 
                    disabled
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
                    <input 
                      type="password" 
                      placeholder="Enter current password to authorize" 
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 text-sm" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">New Password</label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                      type="password" 
                      placeholder="Create a new strong password" 
                      className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 text-sm" 
                    />
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