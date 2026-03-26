import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Clock, Code2, CheckCircle, 
  XCircle, AlertTriangle, FileText, Target, BarChart, GraduationCap
} from 'lucide-react';

export default function StudentAnalyticsProfile({ student, testId, onBack }) {
  // --- UI STATE ---
  const [activeSection, setActiveSection] = useState('coding');
  const [performanceDetails, setPerformanceDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // 🚀 DATA FETCHING: Pull from PostgreSQL
  // ==========================================
  useEffect(() => {
    const fetchDetailedPerformance = async () => {
      try {
        setLoading(true);
        // Uses the dynamic route: /api/tnp/tests/:testId/performance/:studentId
        const response = await fetch(`http://localhost:5000/api/tnp/tests/${testId}/performance/${student.id}`);
        const result = await response.json();
        
        if (result.success) {
          setPerformanceDetails(result.data);
        } else {
          console.error("Failed to load performance details:", result.error);
        }
      } catch (error) {
        console.error("Network Error: Could not reach analytics server.", error);
      } finally {
        setLoading(false);
      }
    };

    if (student && testId) {
      fetchDetailedPerformance();
    }
  }, [student, testId]);

  // --- CRASH PREVENTERS / LOADING ---
  if (!student) return null; 
  if (loading) return <div className="p-20 text-center text-slate-400 animate-pulse font-bold">Retrieving Submission Artifacts...</div>;
  if (!performanceDetails) return <div className="p-20 text-center text-red-500 font-bold">No submission found for this student.</div>;
  
  const studentName = student.name || "Unknown Student";
  const rollNo = student.rollNo || "N/A";
  const branch = student.branch || "Unknown Branch";
  const batch = student.batch || "Unknown Batch";
  const score = student.score || 0;

  // Since coding is now an array from DB, we take the primary submission
  const primaryCoding = performanceDetails.coding[0] || {};

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300 pb-12">
      
      {/* --- HERO BANNER --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row md:items-stretch relative">
        <div className="p-6 flex-1 flex items-start gap-4 border-b md:border-b-0 md:border-r border-slate-100 relative z-10">
          <button 
            onClick={onBack}
            className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 flex-shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-slate-900">{studentName}</h2>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${score >= 60 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                {score >= 60 ? 'Cleared' : 'Needs Review'}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                <FileText size={14} className="text-slate-400" /> {rollNo}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                <GraduationCap size={14} className="text-slate-400" /> {branch}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                <Clock size={14} className="text-slate-400" /> Batch: {batch}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6 md:w-64 bg-slate-50 flex flex-col justify-center items-center text-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Final Score</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-black ${score >= 60 ? 'text-blue-600' : 'text-slate-800'}`}>{score}</span>
            <span className="text-lg font-bold text-slate-400">/150</span>
          </div>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1"><BarChart size={14} className="text-indigo-500"/> Result Status</p>
          <p className="text-2xl font-black text-slate-900">{score >= 60 ? 'PASS' : 'FAIL'}</p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1"><Target size={14} className="text-emerald-500"/> MCQ Result</p>
          <p className="text-2xl font-black text-slate-900">
            {performanceDetails.mcqs.filter(m => m.isRight).length} / {performanceDetails.mcqs.length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1"><Code2 size={14} className="text-blue-500"/> Coding Status</p>
          <p className={`text-xl md:text-2xl font-black truncate ${primaryCoding.status === 'Accepted' ? 'text-emerald-600' : 'text-red-600'}`} title={primaryCoding.status}>
            {primaryCoding.status || 'N/A'}
          </p>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-1"><Clock size={14} className="text-amber-500"/> Exec Time</p>
          <p className="text-2xl font-black text-slate-900">{primaryCoding.execTime || '0ms'}</p>
        </div>
      </div>

      {/* --- SECTION TABS --- */}
      <div className="flex space-x-2 bg-slate-200/50 p-1.5 rounded-xl w-fit border border-slate-200">
        <button
          onClick={() => setActiveSection('coding')}
          className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeSection === 'coding' ? 'bg-white text-blue-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <Code2 size={16} /> Coding Autopsy
        </button>
        <button
          onClick={() => setActiveSection('mcq')}
          className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeSection === 'mcq' ? 'bg-white text-blue-900 shadow-sm border border-slate-200' : 'text-slate-600 hover:text-slate-900'}`}
        >
          <FileText size={16} /> MCQ Review ({performanceDetails.mcqs.length})
        </button>
      </div>

      {/* TAB 1: CODING AUTOPSY */}
      {activeSection === 'coding' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col animate-in fade-in duration-300">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><Code2 size={20} className="text-blue-600"/> {primaryCoding.problem}</h3>
              <p className="text-sm text-slate-500 mt-1">Language: <span className="uppercase">{primaryCoding.language}</span></p>
            </div>
            <span className={`px-4 py-1.5 text-sm font-bold rounded-lg border ${primaryCoding.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-red-100 text-red-800 border-red-200'}`}>
              {primaryCoding.status}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-100 bg-white divide-x divide-slate-100">
            <div className="p-4 text-center">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Exec Time</p>
              <p className="font-mono text-lg font-black text-slate-700">{primaryCoding.execTime}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Memory</p>
              <p className="font-mono text-lg font-black text-slate-700">{primaryCoding.memoryUsed}</p>
            </div>
            <div className="p-4 text-center bg-slate-50">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Test Cases</p>
              <p className={`font-mono text-lg font-black ${primaryCoding.status === 'Accepted' ? 'text-emerald-600' : 'text-red-600'}`}>{primaryCoding.testCasesPassed} / {primaryCoding.totalTestCases}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Score Contribution</p>
              <p className="font-mono text-lg font-black text-blue-600">
                {primaryCoding.status === 'Accepted' ? '60' : '0'} Pts
              </p>
            </div>
          </div>

          <div className="p-5 bg-slate-50 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-700 uppercase mb-3">Logic Execution Matrix</p>
            <div className="flex flex-wrap gap-2">
              {[...Array(primaryCoding.totalTestCases)].map((_, i) => (
                <div 
                  key={i} 
                  className={`h-8 w-8 rounded border flex items-center justify-center text-xs font-bold ${
                    i < primaryCoding.testCasesPassed 
                      ? 'bg-emerald-500 border-emerald-600 text-emerald-50 shadow-sm' 
                      : 'bg-red-500 border-red-600 text-red-50 shadow-sm'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0f172a] p-6 overflow-x-auto rounded-b-xl">
            <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Submitted Source Code</span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono uppercase">{primaryCoding.language}</span>
            </div>
            <pre className="text-sm font-mono text-emerald-400 leading-relaxed">
              <code>{primaryCoding.code}</code>
            </pre>
          </div>
        </div>
      )}

      {/* TAB 2: MCQ TABLE */}
      {activeSection === 'mcq' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2"><FileText size={20} className="text-indigo-600"/> Response Log</h3>
            <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full border border-indigo-200">
              {performanceDetails.mcqs.length} Questions
            </span>
          </div>
          
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-sm relative">
              <thead className="bg-white border-b border-slate-200 text-xs uppercase font-bold text-slate-500 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-4 w-16">ID</th>
                  <th className="px-6 py-4">Section</th>
                  <th className="px-6 py-4 w-1/3">Question Text</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Correct</th>
                  <th className="px-6 py-4 text-center">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {performanceDetails.mcqs.map((mcq) => (
                  <tr key={mcq.id} className={`hover:bg-slate-50 transition-colors ${mcq.isRight ? '' : 'bg-red-50/10'}`}>
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">{mcq.id}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                        {mcq.section}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 truncate max-w-[250px]" title={mcq.question}>
                      {mcq.question}
                    </td>
                    <td className={`px-6 py-4 font-bold ${mcq.isRight ? 'text-emerald-600' : 'text-red-600'}`}>
                      {mcq.selected}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {mcq.correct}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {mcq.isRight 
                        ? <CheckCircle size={20} className="text-emerald-500 mx-auto"/> 
                        : <XCircle size={20} className="text-red-500 mx-auto"/>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}