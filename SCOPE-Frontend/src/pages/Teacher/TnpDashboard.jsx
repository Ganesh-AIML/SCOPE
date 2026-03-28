import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { 
  User, Briefcase, ChevronDown, LogOut, Settings, Mail, BadgeCheck 
} from 'lucide-react';

const TnpMainView = lazy(() => import('./TnpViews/TnpMainView'));
const TnpAnalyticsView = lazy(() => import('./TnpViews/TnpAnalyticsView'));
const ScheduleTest = lazy(() => import('./TnpViews/ScheduleTest'));
const UpcomingTestPreview = lazy(() => import('./TnpViews/UpcomingTestPreview'));
const LiveTestMonitor = lazy(() => import('./TnpViews/LiveTestMonitor'));

export default function TnpDashboard() {
  const navigate = useNavigate();
  const [selectedTest, setSelectedTest] = useState(null); 
  const [selectedUpcomingTest, setSelectedUpcomingTest] = useState(null); 
  const [selectedLiveTest, setSelectedLiveTest] = useState(null); 
  
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [editingDraft, setEditingDraft] = useState(null);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [liveTests, setLiveTests] = useState([]);
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [draftTests, setDraftTests] = useState([]);
  const [pastTests, setPastTests] = useState([]); 

  // 🚀 FETCH 1: Load all tests
  useEffect(() => {
    const fetchAllTests = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/tnp/all-tests', {
          // 🛡️ FIX: Added Authorization Header
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const result = await response.json();

        if (result.success) {
          const now = new Date();
          const upcoming = result.data.filter(test => new Date(test.date) > now);
          const live = result.data.filter(test => new Date(test.date) <= now);

          setUpcomingTests(upcoming);
          setLiveTests(live);
        } else {
          console.error("Error fetching tests:", result.error);
        }
      } catch (error) {
        console.error("Network Error: Could not fetch tests.", error);
      }
    };

    fetchAllTests(); 
  }, []);

  // 🚀 FETCH 2: Publish a new test
  const handlePublishTest = async (newTest) => {
    try {
      const response = await fetch('http://localhost:5000/api/tnp/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 🛡️ FIX: Added Authorization Header
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newTest),
      });

      const result = await response.json();

      if (result.success) {
        alert("Test successfully scheduled in Database!");
        
        const savedTest = result.data;
        const isFuture = new Date(savedTest.date) > new Date();
        
        if (isFuture) {
          setUpcomingTests([savedTest, ...upcomingTests]);
        } else {
          setLiveTests([savedTest, ...liveTests]);
        }
        
        setIsCreatingTest(false); 
        setEditingDraft(null); 
      } else {
        alert("Error saving test: " + (result.error || result.message));
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Failed to connect to the server. Is it running?");
    }
  };

  const handleSaveDraft = (draftData) => {
    setDraftTests([draftData, ...draftTests.filter(d => d.id !== draftData.id)]);
    setIsCreatingTest(false);
    setEditingDraft(null);
  };

  const handleResumeDraft = (draft) => {
    setEditingDraft(draft);
    setIsCreatingTest(true);
  };

  const handleEditClick = () => {
    alert("Edit Mode Activated! In production, this pre-fills the form with the test details.");
    setSelectedUpcomingTest(null);
    setIsCreatingTest(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    navigate('/'); 
  };

  // 🚀 FETCH 3: Delete a test
  const handleDeleteTest = async (testId, category) => {
    if (!window.confirm("Are you sure you want to delete this test? This action cannot be undone.")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/tnp/test/${testId}`, {
        method: 'DELETE',
        // 🛡️ FIX: Added Authorization Header
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      const result = await response.json();

      if (result.success) {
        if (category === 'upcoming') {
          setUpcomingTests(prev => prev.filter(t => t.id !== testId));
        } else if (category === 'live') {
          setLiveTests(prev => prev.filter(t => t.id !== testId));
        }
      } else {
        alert("Error deleting test: " + result.error);
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Failed to connect to the server.");
    }
  };

  // 🚀 FETCH 4: View Test Details
  const handleViewTestDetails = async (testShallow) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tnp/test/${testShallow.id}`, {
        // 🛡️ FIX: Added Authorization Header
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const result = await response.json();

      if (result.success) {
        setSelectedUpcomingTest(result.data); 
      } else {
        alert("Error loading test details: " + result.error);
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Failed to fetch test details.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-900 rounded-md flex items-center justify-center">
                <Briefcase size={18} className="text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                S.C.O.P.E. <span className="text-blue-900">T&P Admin</span>
              </h1>
            </div>

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors outline-none"
              >
                <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-slate-900 leading-tight">Prof. R.K. Sharma</p>
                  <p className="text-xs text-slate-500 font-medium">Head of T&P Cell</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-900">
                    <User size={20} />
                  </div>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                      <p className="font-bold text-slate-900">Prof. R.K. Sharma</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5 font-medium">
                        <Mail size={14} className="text-slate-400"/> rk.sharma@scope.edu
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 font-medium">
                        <BadgeCheck size={14} className="text-emerald-500"/> EMP ID: TNP-4021
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 font-bold hover:bg-slate-50 hover:text-blue-700 rounded-lg transition-colors">
                        <Settings size={16} /> Account Settings
                      </button>
                      <div className="h-px bg-slate-100 my-1"></div>
                      <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Suspense fallback={<div className="flex items-center justify-center py-20 text-slate-400 text-sm">Loading...</div>}>
        {isCreatingTest ? (
          <ScheduleTest 
            initialData={editingDraft}
            onBack={() => { setIsCreatingTest(false); setEditingDraft(null); }} 
            onPublish={handlePublishTest} 
            onSaveDraft={handleSaveDraft}
          />
        ) : selectedLiveTest ? (
          <LiveTestMonitor 
            test={selectedLiveTest}
            onBack={() => setSelectedLiveTest(null)}
          />
        ) : selectedUpcomingTest ? (
          <UpcomingTestPreview 
            test={selectedUpcomingTest}
            onBack={() => setSelectedUpcomingTest(null)}
            onEdit={handleEditClick}
          />
        ) : selectedTest ? (
          <TnpAnalyticsView 
            selectedTest={selectedTest} 
            setSelectedTest={setSelectedTest} 
          />
        ) : (
          <TnpMainView 
            setSelectedTest={setSelectedTest} 
            onScheduleClick={() => setIsCreatingTest(true)} 
            onViewUpcoming={handleViewTestDetails}
            onResumeDraft={handleResumeDraft} 
            onMonitorLive={(test) => setSelectedLiveTest(test)} 
            onDeleteTest={handleDeleteTest}
            pastTests={pastTests} 
            liveTests={liveTests} 
            upcomingTests={upcomingTests}
            draftTests={draftTests} 
          />
        )}
        </Suspense>
      </main>
    </div>
  );
}