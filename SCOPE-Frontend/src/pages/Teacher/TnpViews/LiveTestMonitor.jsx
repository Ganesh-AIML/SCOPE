import { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, AlertOctagon, Users, CheckCircle, Clock,
  BarChart2, Filter, StopCircle, Target, Trophy,
  Zap, BookOpen, Shield, AlertTriangle
} from 'lucide-react';

const DEPTS   = ['CSE', 'IT', 'ECE', 'MECH'];
const DIVS    = ['A', 'B', 'C', 'D'];

const Badge = ({ children, color = 'slate' }) => {
  const map = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber:   'bg-amber-50   text-amber-700   border-amber-200',
    red:     'bg-red-50     text-red-700     border-red-200',
    blue:    'bg-blue-50    text-blue-700    border-blue-200',
    purple:  'bg-purple-50  text-purple-700  border-purple-200',
    slate:   'bg-slate-100  text-slate-600   border-slate-200',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${map[color]}`}>{children}</span>;
};

const KpiCard = ({ label, value, sub, icon, color = 'blue' }) => {
  const Icon = icon;
  const accent = { blue: 'text-blue-600 bg-blue-50', emerald: 'text-emerald-600 bg-emerald-50', amber: 'text-amber-600 bg-amber-50', purple: 'text-purple-600 bg-purple-50', red: 'text-red-600 bg-red-50' }[color];
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
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden"><div className={`${fill} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} /></div>
      <span className={`text-xs font-bold w-8 text-right ${isCorrect ? 'text-emerald-600' : isMostWrong ? 'text-red-500' : 'text-slate-500'}`}>{pct}%</span>
    </div>
  );
};

export default function LiveTestMonitor({ test, onBack }) {
  const [tab, setTab] = useState('overview');
  const [dept, setDept] = useState('All');
  const [div, setDiv] = useState('All');
  const [section, setSection] = useState('All');

  // 🛡️ THE ROOT FIX: Pulling Real Data from the Database
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/tnp/test/${test.id}/analytics`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const result = await res.json();
        if (result.success) setAnalyticsData(result.data);
      } catch (e) { console.error(e); } 
      finally { setLoading(false); }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 30000); // Live poll every 30s
    return () => clearInterval(interval);
  }, [test.id]);

  const { allStudents, QUESTIONS, CODING_PROBLEMS } = useMemo(() => {
    if (!analyticsData) return { allStudents: [], QUESTIONS: [], CODING_PROBLEMS: [] };
    const { test: dbTest, results } = analyticsData;

    let students = results.map(r => {
      const aptScore = r.aptScore || 0;
      const techScore = r.techScore || 0;
      return {
        id: r.studentId, name: r.user?.name || 'Unknown', roll: r.user?.studentProfile?.rollNo || 'N/A',
        dept: r.user?.studentProfile?.branch || 'General', div: r.user?.studentProfile?.division || 'A',
        aptScore, techScore, codScore: r.totalScore - (aptScore + techScore), total: r.totalScore || 0,
        timeTaken: r.timeTaken || 0, alerts: 0, status: 'Submitted'
      };
    });

    students.sort((a, b) => a.total - b.total);
    students.forEach((s, idx) => { s.percentile = students.length > 1 ? Math.round((idx / (students.length - 1)) * 100) : 100; });
    students.sort((a, b) => b.total - a.total); 

    const questions = [];
    dbTest.sections?.forEach(sec => {
      sec.questions?.forEach(q => {
        const responses = { A: 0, B: 0, C: 0, D: 0, None: 0 };
        results.forEach(r => {
          const sub = r.mcqSubmissions?.find(m => m.questionId === q.id);
          if (sub && sub.selectedOption && responses[sub.selectedOption] !== undefined) responses[sub.selectedOption]++;
        });
        questions.push({ id: q.id, section: sec.name.toLowerCase(), text: q.text, options: { A: q.optA, B: q.optB, C: q.optC, D: q.optD }, correct: q.ans, responses });
      });
    });

    const coding = dbTest.codingProblems?.map(cp => {
      const buckets = new Array((cp.testCases?.length || 10) + 1).fill(0);
      results.forEach(r => {
        const sub = r.codingSubmissions?.find(c => c.problemId === cp.id);
        const passed = sub ? Math.min(sub.testCasesPassed || 0, cp.testCases?.length || 10) : 0;
        buckets[passed]++;
      });
      return { id: cp.id, title: cp.title, difficulty: 'Medium', marks: cp.marks, totalTestCases: cp.testCases?.length || 10, passBuckets: buckets };
    }) || [];

    return { allStudents: students, QUESTIONS: questions, CODING_PROBLEMS: coding };
  }, [analyticsData]);

  const filtered = useMemo(() => allStudents.filter(s => (dept === 'All' || s.dept === dept) && (div === 'All' || s.div === div)), [allStudents, dept, div]);

  if (loading) return <div className="p-20 text-center text-slate-500 font-bold animate-pulse">Connecting to Secure Database...</div>;

  const submitted = filtered.filter(s => s.status === 'Submitted');
  const totalStudents = filtered.length || 1;
  const avgScore = submitted.length ? Math.round(submitted.reduce((a, s) => a + s.total, 0) / submitted.length) : 0;
  const topScore = submitted.length ? Math.max(...submitted.map(s => s.total)) : 0;
  const visibleQs = QUESTIONS.filter(q => section === 'All' || q.section === section);

  const buckets = [
    { label: '0–10',  min: 0,  max: 10  }, { label: '11–20', min: 11, max: 20  }, { label: '21–30', min: 21, max: 30  },
    { label: '31–40', min: 31, max: 40  }, { label: '41–50', min: 41, max: 50  },
  ].map(b => ({ ...b, count: submitted.filter(s => s.total >= b.min && s.total <= b.max).length }));
  const maxBucket = Math.max(...buckets.map(b => b.count), 1);

  return (
    <div className="space-y-5 pb-16 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 shrink-0"><ArrowLeft size={20} /></button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" /></span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Live: {test.title}</h2>
                <Badge color="red">LIVE</Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs font-mono text-slate-500 flex-wrap">
                <span className="flex items-center gap-1 text-red-600 font-bold"><Clock size={12} /> {test.timeRemaining}</span>
                <span>{allStudents.length} registered · {submitted.length} submitted · 0 active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm shrink-0"><Filter size={15} /> Filter by:</div>
          <div className="flex flex-wrap gap-3 flex-1">
            <select value={dept} onChange={e => setDept(e.target.value)} className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 min-w-[140px]">
              <option value="All">All Departments</option>{DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={div} onChange={e => setDiv(e.target.value)} className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 min-w-[130px]">
              <option value="All">All Divisions</option>{DIVS.map(d => <option key={d} value={d}>Division {d}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Students"  value={filtered.length}     icon={Users}      color="blue"    sub={`${DEPTS.length} departments`} />
        <KpiCard label="Submitted"       value={submitted.length}    icon={CheckCircle} color="emerald" sub="Secure submissions" />
        <KpiCard label="In Progress"     value={0}                   icon={Clock}      color="amber"   sub="Active right now" />
        <KpiCard label="Avg Score"       value={`${avgScore}/50`}    icon={Target}     color="purple"  sub={`Top score: ${topScore}`} />
        <KpiCard label="Proctoring Alerts" value={0}                 icon={AlertOctagon} color="red"   sub="Across all students" />
      </div>

      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex gap-1 overflow-x-auto">
        {[
          { id: 'overview',  label: 'Overview',           Icon: BarChart2,  active: 'bg-blue-50 text-blue-700 border-blue-200' },
          { id: 'questions', label: 'Question Analytics', Icon: BookOpen,   active: 'bg-purple-50 text-purple-700 border-purple-200' },
          { id: 'students',  label: 'Student Leaderboard',Icon: Trophy,     active: 'bg-amber-50 text-amber-700 border-amber-200'  }
        ].map(({ id, label, Icon, active }) => (
          <button key={id} onClick={() => setTab(id)} className={`flex-1 whitespace-nowrap flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all border ${tab === id ? active + ' shadow-sm' : 'text-slate-500 hover:bg-slate-50 border-transparent'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1 text-base">Score Distribution</h3>
            <p className="text-xs text-slate-400 mb-5">Submitted students only · out of 50</p>
            {submitted.length === 0 ? <div className="h-44 flex items-center justify-center text-slate-400 text-sm font-medium border border-dashed border-slate-200 rounded-xl">No submissions yet</div> : (
              <div className="flex items-end gap-2" style={{ height: '160px' }}>
                {buckets.map((b, i) => {
                  const barH = maxBucket > 0 ? Math.max(Math.round((b.count / maxBucket) * 128), b.count > 0 ? 8 : 0) : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <span className="text-xs font-bold text-blue-600 transition-opacity" style={{ opacity: b.count > 0 ? 1 : 0 }}>{b.count}</span>
                      <div className="w-full flex items-end" style={{ height: '128px' }}><div className="w-full bg-blue-500 rounded-t-md group-hover:bg-blue-600 transition-colors" style={{ height: `${barH}px` }} /></div>
                      <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">{b.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1 text-base">Avg Score by Department</h3>
            <p className="text-xs text-slate-400 mb-6">Among submitted students</p>
            <div className="space-y-4">
              {DEPTS.map(d => {
                const deptSub = allStudents.filter(s => s.dept === d && s.total !== null);
                const avg = deptSub.length ? Math.round(deptSub.reduce((a, s) => a + s.total, 0) / deptSub.length) : 0;
                const pct = Math.round((avg / 50) * 100);
                const colorMap = { CSE: 'bg-blue-500', IT: 'bg-purple-500', ECE: 'bg-emerald-500', MECH: 'bg-amber-500' };
                return (
                  <div key={d} className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-700 w-12">{d}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden"><div className={`${colorMap[d] || 'bg-slate-500'} h-3 rounded-full`} style={{ width: `${pct}%` }} /></div>
                    <span className="text-sm font-black text-slate-700 w-12 text-right">{avg}/50</span>
                    <span className="text-xs text-slate-400 w-10 text-right">{deptSub.length} sub</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1"><h3 className="font-black text-slate-900 text-base">Coding Section — Test Case Pass Rate</h3><Badge color="blue">Live</Badge></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {CODING_PROBLEMS.map(prob => {
                const total = prob.passBuckets.reduce((a, b) => a + b, 0) || 1;
                const fullPass = prob.passBuckets[prob.totalTestCases];
                const zeroPass = prob.passBuckets[0];
                const partial = prob.passBuckets.slice(1, prob.totalTestCases).reduce((a, b) => a + b, 0);
                return (
                  <div key={prob.id} className="border border-slate-100 rounded-xl p-5 bg-slate-50">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div><p className="text-sm font-black text-slate-900">{prob.title}</p><p className="text-xs text-slate-400 mt-0.5">{prob.marks} marks · {prob.totalTestCases} test cases</p></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center"><p className="text-lg font-black text-emerald-700">{fullPass}</p><p className="text-[10px] font-bold text-emerald-600 mt-0.5">All 10 passed</p></div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center"><p className="text-lg font-black text-amber-700">{partial}</p><p className="text-[10px] font-bold text-amber-600 mt-0.5">Partial (1–9)</p></div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center"><p className="text-lg font-black text-red-600">{zeroPass}</p><p className="text-[10px] font-bold text-red-500 mt-0.5">0 passed</p></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'questions' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3 text-sm text-purple-800 font-medium">
            <Zap size={18} className="text-purple-500 shrink-0" />
            <span>Showing analytics from <strong>{submitted.length} submissions</strong>. Data updates automatically.</span>
          </div>
          {visibleQs.map((q, idx) => {
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
      )}

      {tab === 'students' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div><h3 className="font-black text-slate-900">Student Leaderboard</h3><p className="text-xs text-slate-400 mt-0.5">{filtered.length} students · ranked by total score</p></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-5 py-3.5 w-16">Rank</th><th className="px-5 py-3.5">Student</th><th className="px-5 py-3.5">Dept / Div</th><th className="px-5 py-3.5 text-center">Total</th><th className="px-5 py-3.5 text-center">Percentile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5"><span className="font-black text-sm text-slate-400">#{idx + 1}</span></td>
                    <td className="px-5 py-3.5"><p className="font-bold text-slate-900 text-sm">{s.name}</p><p className="text-xs font-mono text-slate-400">{s.roll}</p></td>
                    <td className="px-5 py-3.5"><span className="font-bold text-slate-600 text-xs">{s.dept} / {s.div}</span></td>
                    <td className="px-5 py-3.5 text-center"><span className="font-black text-base text-slate-900">{s.total}</span></td>
                    <td className="px-5 py-3.5 text-center"><span className="font-black text-sm text-blue-600">{s.percentile}th</span></td>
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