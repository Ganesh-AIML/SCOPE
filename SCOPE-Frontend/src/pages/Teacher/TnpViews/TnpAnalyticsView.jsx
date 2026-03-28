import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, Users, CheckCircle, Target, Trophy,
  BookOpen, Code2, BrainCircuit, BarChart2, Download,
  Filter, TrendingUp, Award, AlertOctagon, Database, SlidersHorizontal, Search
} from 'lucide-react';

const DEPTS = ['CSE', 'IT', 'ECE', 'MECH'];
const DIVS  = ['A', 'B', 'C', 'D'];
const TAG_LABELS = { general: 'General Assessment' };

const Badge = ({ children, color = 'slate' }) => {
  const map = { emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200', amber: 'bg-amber-50 text-amber-700 border-amber-200', red: 'bg-red-50 text-red-700 border-red-200', blue: 'bg-blue-50 text-blue-700 border-blue-200', purple: 'bg-purple-50 text-purple-700 border-purple-200', slate: 'bg-slate-100 text-slate-600 border-slate-200', indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${map[color]}`}>{children}</span>;
};

const KpiCard = ({ label, value, sub, icon, color = 'blue' }) => {
  const Icon = icon;
  const accent = { blue: 'text-blue-600 bg-blue-50', emerald: 'text-emerald-600 bg-emerald-50', amber: 'text-amber-600 bg-amber-50', purple: 'text-purple-600 bg-purple-50', red: 'text-red-600 bg-red-50', indigo: 'text-indigo-600 bg-indigo-50' }[color];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span><span className={`p-2 rounded-lg ${accent}`}><Icon size={15} /></span></div>
      <p className={`text-3xl font-black ${accent.split(' ')[0]}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 font-medium">{sub}</p>}
    </div>
  );
};

const MiniBar = ({ pct, isCorrect, isMostWrong }) => {
  const fill = isCorrect ? 'bg-emerald-500' : isMostWrong ? 'bg-red-400' : 'bg-slate-300';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden"><div className={`${fill} h-2 rounded-full`} style={{ width: `${pct}%` }} /></div>
      <span className={`text-xs font-bold w-8 text-right ${isCorrect ? 'text-emerald-600' : isMostWrong ? 'text-red-500' : 'text-slate-500'}`}>{pct}%</span>
    </div>
  );
};

const exportToExcel = (students, testTitle) => {
  const headers = ['Rank','Name','Roll No','Dept','Div','Aptitude','Technical','Coding','Total','Percentile'];
  const rows = students.map((s, idx) => [idx + 1, s.name, s.roll, s.dept, s.div, s.aptScore, s.techScore, s.codScore, s.total, s.percentile + 'th']);
  let csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url; a.download = `${testTitle.replace(/\s+/g, '_')}_Results.csv`; a.click(); URL.revokeObjectURL(url);
};

const LeaderboardTable = ({ students, scoreKey, maxScore, scoreLabel, showSections = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const medals = ['🥇', '🥈', '🥉'];
  const studentsWithRank = useMemo(() => students.map((s, i) => ({ ...s, rank: i + 1 })), [students]);
  const filteredList = useMemo(() => {
    if (!searchTerm) return studentsWithRank;
    const lower = searchTerm.toLowerCase();
    return studentsWithRank.filter(s => s.name.toLowerCase().includes(lower) || s.roll.toLowerCase().includes(lower));
  }, [studentsWithRank, searchTerm]);

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input type="text" placeholder="Search student by name or roll no..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-400 tracking-wider">
              <th className="px-4 py-3">Rank</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Dept / Div</th>
              {showSections && <><th className="px-4 py-3 text-center">Apt</th><th className="px-4 py-3 text-center">Tech</th><th className="px-4 py-3 text-center">Coding</th></>}
              <th className="px-4 py-3 text-center">{scoreLabel}</th><th className="px-4 py-3 text-center">Percentile</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList.slice(0, 50).map((s) => (
              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3"><span className="font-black text-sm text-slate-500">{s.rank <= 3 ? medals[s.rank - 1] : `#${s.rank}`}</span></td>
                <td className="px-4 py-3"><p className="font-bold text-slate-900 text-sm">{s.name}</p><p className="text-xs font-mono text-slate-500">{s.roll}</p></td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600">{s.dept} / {s.div}</td>
                {showSections && <><td className="px-4 py-3 text-center font-bold text-indigo-700 text-xs">{s.aptScore}</td><td className="px-4 py-3 text-center font-bold text-emerald-700 text-xs">{s.techScore}</td><td className="px-4 py-3 text-center font-bold text-blue-700 text-xs">{s.codScore}</td></>}
                <td className="px-4 py-3 text-center"><span className="font-black text-slate-900">{s[scoreKey]}</span></td>
                <td className="px-4 py-3 text-center"><span className="font-black text-sm text-blue-600">{s.percentile}th</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function TnpAnalyticsView({ selectedTest, setSelectedTest }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [dept, setDept] = useState('All');
  const [div, setDiv] = useState('All');
  const [cutoffs, setCutoffs] = useState({ overall: 90, coding: 50, aptitude: 0, technical: 0 });

  // 🛡️ THE ROOT FIX: Pulling Real Data from Database
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/tnp/test/${selectedTest.id}/analytics`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const result = await res.json();
        if (result.success) setAnalyticsData(result.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    if (selectedTest?.id) fetchData();
  }, [selectedTest]);

  const { allStudents, QUESTIONS, CODING_PROBLEMS } = useMemo(() => {
    if (!analyticsData) return { allStudents: [], QUESTIONS: [], CODING_PROBLEMS: [] };
    const { test, results } = analyticsData;

    let students = results.map(r => {
      const aptScore = r.aptScore || 0;
      const techScore = r.techScore || 0;
      return {
        id: r.studentId, name: r.user?.name || 'Unknown', roll: r.user?.studentProfile?.rollNo || 'N/A',
        dept: r.user?.studentProfile?.branch || 'General', div: r.user?.studentProfile?.division || 'A',
        aptScore, techScore, codScore: r.totalScore - (aptScore + techScore), total: r.totalScore || 0,
        timeTaken: r.timeTaken || 0, alerts: 0, tagScores: { general: 5 }, status: 'Submitted'
      };
    });

    students.sort((a, b) => b.total - a.total);
    students.forEach((s, idx) => { s.percentile = students.length > 1 ? Math.round(((students.length - 1 - idx) / (students.length - 1)) * 100) : 100; });
    students.sort((a, b) => b.total - a.total);

    const questions = [];
    test.sections?.forEach(sec => {
      sec.questions?.forEach(q => {
        const responses = { A: 0, B: 0, C: 0, D: 0 };
        results.forEach(r => {
          const sub = r.mcqSubmissions?.find(m => m.questionId === q.id);
          if (sub && sub.selectedOption && responses[sub.selectedOption] !== undefined) responses[sub.selectedOption]++;
        });
        questions.push({ id: q.id, section: sec.name.toLowerCase(), tag: 'general', text: q.text, options: { A: q.optA, B: q.optB, C: q.optC, D: q.optD }, correct: q.ans, responses });
      });
    });

    const coding = test.codingProblems?.map(cp => {
      const passBuckets = new Array((cp.testCases?.length || 10) + 1).fill(0);
      results.forEach(r => {
        const sub = r.codingSubmissions?.find(c => c.problemId === cp.id);
        const passed = sub ? Math.min(sub.testCasesPassed || 0, cp.testCases?.length || 10) : 0;
        passBuckets[passed]++;
      });
      return { id: cp.id, title: cp.title, difficulty: 'Medium', marks: cp.marks, totalTC: cp.testCases?.length || 10, passBuckets };
    }) || [];

    return { allStudents: students, QUESTIONS: questions, CODING_PROBLEMS: coding };
  }, [analyticsData]);

  const baseStudents = useMemo(() => allStudents.map(s => ({
      ...s, qualified: (s.total >= cutoffs.overall) && (s.codScore >= cutoffs.coding) && (s.aptScore >= cutoffs.aptitude) && (s.techScore >= cutoffs.technical)
  })), [allStudents, cutoffs]);

  const filtered = useMemo(() => baseStudents.filter(s => (dept === 'All' || s.dept === dept) && (div === 'All' || s.div === div)), [baseStudents, dept, div]);

  if (loading) return <div className="p-20 text-center text-slate-500 font-bold animate-pulse">Aggregating Global Analytics...</div>;

  const qualified = baseStudents.filter(s => s.qualified);
  const topScore = baseStudents[0]?.total ?? 0;
  const avgTotal = baseStudents.length ? Math.round(baseStudents.reduce((a, s) => a + s.total, 0) / baseStudents.length) : 0;
  const testTitle = selectedTest?.title ?? 'Test Analytics';

  const SECTIONS = [
    { id: 'overview',  label: 'Overview',          icon: BarChart2,    color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'aptitude',  label: 'Aptitude',           icon: BrainCircuit, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 'technical', label: 'Technical',          icon: Database,     color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'coding',    label: 'Coding',             icon: Code2,        color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'overall',   label: 'Overall Leaderboard',icon: Trophy,       color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'questions', label: 'Question Analysis',  icon: BookOpen,     color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  return (
    <div className="space-y-5 pb-16 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedTest(null)} className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 shrink-0"><ArrowLeft size={20} /></button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">{testTitle}</h2>
                <Badge color="slate">Completed</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">{baseStudents.length} students appeared · {qualified.length} qualified</p>
            </div>
          </div>
          <button onClick={() => exportToExcel(baseStudents, testTitle)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm shadow-sm shrink-0">
            <Download size={16} /> Export Results (.csv)
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm shrink-0 w-32"><Filter size={15} /> Filter:</div>
          <div className="flex flex-wrap gap-3 flex-1">
            <select value={dept} onChange={e => { setDept(e.target.value); setDiv('All'); }} className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 rounded-lg px-3 py-2 min-w-[150px]">
              <option value="All">All Departments</option>{DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard label="Appeared"     value={baseStudents.length} icon={Users}      color="blue"    sub="Total students" />
        <KpiCard label="Qualified"    value={qualified.length}   icon={CheckCircle} color="emerald" sub="Passed Cutoffs" />
        <KpiCard label="Top Score"    value={topScore}           icon={Award}      color="amber"   sub="Highest attained" />
        <KpiCard label="Avg Score"    value={avgTotal}           icon={BrainCircuit} color="indigo" sub="Batch average" />
      </div>

      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex gap-1 overflow-x-auto">
        {SECTIONS.map(({ id, label, icon, color }) => {
          const SectionIcon = icon;
          return (
            <button key={id} onClick={() => setActiveSection(id)} className={`flex-1 whitespace-nowrap flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all border ${activeSection === id ? color + ' shadow-sm' : 'text-slate-500 hover:bg-slate-50 border-transparent'}`}>
              <SectionIcon size={14} /> {label}
            </button>
          );
        })}
      </div>

      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Percentile Band Distribution</h3>
            <p className="text-xs text-slate-400 mb-5">Among all {baseStudents.length} students</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Top 10% (90–100)', min: 90, color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
                { label: 'Good (75–89)',      min: 75, max: 89, color: 'bg-blue-50 border-blue-200 text-blue-800' },
                { label: 'Average (50–74)',   min: 50, max: 74, color: 'bg-amber-50 border-amber-200 text-amber-800' },
                { label: 'Below avg (<50)',   max: 49, color: 'bg-red-50 border-red-200 text-red-700' },
              ].map(band => {
                const count = baseStudents.filter(s => {
                  const p = s.percentile ?? 0;
                  if (band.min !== undefined && p < band.min) return false;
                  if (band.max !== undefined && p > band.max) return false;
                  return true;
                }).length;
                const pct = baseStudents.length ? Math.round((count / baseStudents.length) * 100) : 0;
                return (
                  <div key={band.label} className={`rounded-xl border p-4 ${band.color}`}>
                    <p className="text-2xl font-black">{count}</p>
                    <p className="text-xs font-bold mt-0.5 opacity-80">{band.label}</p>
                    <p className="text-xs mt-1 opacity-60">{pct}% of students</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'questions' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3 text-sm text-purple-800 font-medium">
            <TrendingUp size={18} className="text-purple-500 shrink-0" />
            <span>Based on <strong>{baseStudents.length} submissions</strong>.</span>
          </div>
          <div className="space-y-4">
            {QUESTIONS.map((q, idx) => {
              const total = Object.values(q.responses).reduce((a, b) => a + b, 0) || 1;
              const pcts = Object.fromEntries(Object.entries(q.responses).map(([k, v]) => [k, Math.round((v / total) * 100)]));
              const wrongOpts = Object.entries(pcts).filter(([k]) => k !== q.correct).sort(([, a], [, b]) => b - a);
              const mostWrong = wrongOpts[0]?.[0];
              const correctPct = pcts[q.correct] || 0;
              return (
                <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-5">
                    <div className="flex items-start gap-3 flex-1 min-w-0"><span className="shrink-0 text-xs font-black bg-slate-100 text-slate-500 px-2.5 py-1.5 rounded-lg">Q{idx + 1}</span><div><p className="text-sm font-bold text-slate-900 leading-relaxed">{q.text}</p></div></div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap"><Badge color="emerald">{correctPct}% correct</Badge></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const isCorrect = opt === q.correct;
                      const isMostWrong = opt === mostWrong;
                      return (
                        <div key={opt} className={`rounded-xl border p-4 ${isCorrect ? 'bg-emerald-50 border-emerald-200' : isMostWrong ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2"><span className={`text-xs font-black w-5 h-5 flex items-center justify-center rounded ${isCorrect ? 'bg-emerald-500 text-white' : isMostWrong ? 'bg-red-400 text-white' : 'bg-slate-200 text-slate-600'}`}>{opt}</span><span className="text-xs text-slate-700 font-medium leading-snug">{q.options[opt]}</span></div>
                          </div>
                          <MiniBar pct={pcts[opt] ?? 0} isCorrect={isCorrect} isMostWrong={isMostWrong} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSection === 'overall' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50">
            <div><h3 className="font-black text-slate-900">Overall Leaderboard</h3></div>
          </div>
          <LeaderboardTable students={filtered} scoreKey="total" maxScore={150} scoreLabel="Total" showSections />
        </div>
      )}
    </div>
  );
}