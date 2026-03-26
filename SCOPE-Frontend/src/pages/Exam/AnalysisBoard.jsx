import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Clock, Cpu, Trophy, CheckCircle, Flame, Medal
} from 'lucide-react';

export default function AnalysisBoard() {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  // State for real-time database data
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // 🚀 DATA FETCHING: Pull from PostgreSQL
  // ==========================================
  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/student/analysis/${examId}`);
        const result = await response.json();
        
        if (result.success) {
          setAnalysis(result.data);
        } else {
          console.error("Analysis data not found:", result.error);
        }
      } catch (error) {
        console.error("Network Error: Could not fetch analysis board.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [examId]);

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">
        Generating Performance Analytics...
      </div>
    );
  }

  // Fallback if no result exists
  if (!analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-500">
        <p className="mb-4">No submission data found for this exam.</p>
        <button onClick={() => navigate('/dashboard')} className="text-blue-900 font-bold underline">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      
      {/* --- TOP NAVBAR --- */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-900 font-bold text-sm transition-colors"
            >
              <ChevronLeft size={18} /> Back to Dashboard
            </button>
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-500" />
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Submission <span className="text-emerald-600">Analyzed</span>
              </h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* --- 1. THE PERFORMANCE CHART SECTION --- */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm">
          
          <h2 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight border-b pb-4">
            Test: {analysis.testTitle}
          </h2>

          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            
            {/* Runtime Box */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-slate-600 font-semibold mb-3">
                <Clock size={16} /> Avg Runtime
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  {analysis.metrics.runtime} <span className="text-lg font-medium text-slate-500">ms</span>
                </span>
                <div className="h-6 w-[1px] bg-slate-300 mx-2"></div>
                <span className="text-slate-500 font-medium">Beats <span className="text-slate-900 font-bold text-xl">{analysis.metrics.beatsRuntime}%</span></span>
                <Flame size={20} className="text-emerald-500 ml-1" />
              </div>
            </div>

            {/* Memory Box */}
            <div className="p-5 flex flex-col justify-center opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
              <div className="flex items-center gap-2 text-slate-500 font-semibold mb-3">
                <Cpu size={16} /> Memory Usage
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-slate-500">
                  {analysis.metrics.memory} <span className="text-base font-medium">MB</span>
                </span>
                <div className="h-5 w-[1px] bg-slate-200 mx-2"></div>
                <span className="text-slate-400 font-medium font-bold">Beats {analysis.metrics.beatsMemory}%</span>
              </div>
            </div>

          </div>

          {/* The Distribution Chart (Bell Curve) */}
          <div className="relative h-48 w-full border-b border-slate-200 flex items-end justify-between gap-1 pb-2">
            
            {/* Y-Axis Guides */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="w-full border-t border-slate-300"></div>
              <div className="w-full border-t border-slate-300"></div>
              <div className="w-full border-t border-slate-300"></div>
            </div>

            {/* The Bars mapped from DB results */}
            {analysis.chartData?.map((data, index) => (
              <div key={index} className="relative flex-1 flex justify-center group h-full items-end">
                {/* User Avatar pop-up */}
                {data.isUser && (
                  <div className="absolute -top-10 z-10 flex flex-col items-center animate-bounce">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-500 shadow-md bg-blue-900 flex items-center justify-center text-[10px] text-white font-bold">
                      YOU
                    </div>
                  </div>
                )}
                
                {/* The Actual Bar */}
                <div 
                  className={`w-full max-w-[12px] rounded-t-sm transition-all duration-500 ease-out hover:opacity-80
                    ${data.isUser ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-300'}
                  `}
                  style={{ height: `${data.height}%` }}
                ></div>
              </div>
            ))}
          </div>
          
          {/* X-Axis Labels */}
          <div className="flex justify-between text-xs font-bold text-slate-400 mt-3 px-4 uppercase tracking-widest">
            <span>Faster</span>
            <span>Global Average Performance</span>
            <span>Slower</span>
          </div>

        </div>

        {/* --- 2. THE LEADERBOARD SECTION --- */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          
          <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <Trophy size={24} className="text-amber-500" />
              <h2 className="text-xl font-bold text-slate-900">Live Global Leaderboard</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4 text-center w-16">Rank</th>
                  <th className="px-6 py-4">Student Identity</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4 text-right">Completion Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analysis.leaderboard?.map((user, index) => (
                  <tr 
                    key={index} 
                    className={`transition-colors ${user.name === 'You' ? 'bg-blue-50/50 hover:bg-blue-50' : 'bg-white hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-4 text-center">
                      {user.rank === 1 ? <Medal size={20} className="text-amber-500 mx-auto" /> : 
                       user.rank === 2 ? <Medal size={20} className="text-slate-400 mx-auto" /> : 
                       user.rank === 3 ? <Medal size={20} className="text-amber-700 mx-auto" /> : 
                       <span className="font-bold text-slate-400">{user.rank}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`font-bold ${user.name === 'You' ? 'text-blue-900' : 'text-slate-900'}`}>
                          {user.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono uppercase tracking-tighter">Student Participant</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 text-center">{user.score} Pts</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-500">
                      {user.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </main>
    </div>
  );
}