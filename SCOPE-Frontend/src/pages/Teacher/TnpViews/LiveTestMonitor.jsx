import { useState, useMemo } from 'react';
import {
  ArrowLeft, AlertOctagon, Users, CheckCircle, Clock,
  BarChart2, Filter, StopCircle, Target, Trophy,
  Zap, BookOpen, Shield, AlertTriangle
} from 'lucide-react';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DEPTS   = ['CSE', 'IT', 'ECE', 'MECH'];
const DIVS    = ['A', 'B', 'C', 'D'];
const BATCHES = ['2025'];

const QUESTIONS = [
  {
    id: 1, section: 'aptitude',
    text: 'A train travels 60 km in 1 hour. How long will it take to travel 210 km?',
    options: { A: '2.5 hours', B: '3 hours', C: '3.5 hours', D: '4 hours' },
    correct: 'C',
    responses: { A: 8, B: 19, C: 61, D: 12 },
  },
  {
    id: 2, section: 'aptitude',
    text: 'Find the next number in the series: 2, 6, 12, 20, 30, ?',
    options: { A: '40', B: '42', C: '44', D: '38' },
    correct: 'B',
    responses: { A: 29, B: 41, C: 18, D: 12 },
  },
  {
    id: 3, section: 'technical',
    text: 'What is the time complexity of Binary Search on a sorted array of N elements?',
    options: { A: 'O(N)', B: 'O(N log N)', C: 'O(log N)', D: 'O(1)' },
    correct: 'C',
    responses: { A: 5, B: 14, C: 74, D: 7 },
  },
  {
    id: 4, section: 'technical',
    text: 'Which page replacement algorithm suffers from Belady\'s Anomaly?',
    options: { A: 'LRU', B: 'Optimal', C: 'FIFO', D: 'LFU' },
    correct: 'C',
    responses: { A: 22, B: 11, C: 43, D: 24 },
  },
  {
    id: 5, section: 'technical',
    text: 'In SQL, which clause filters groups after aggregation?',
    options: { A: 'WHERE', B: 'GROUP BY', C: 'HAVING', D: 'ORDER BY' },
    correct: 'C',
    responses: { A: 31, B: 9, C: 52, D: 8 },
  },
  {
    id: 6, section: 'aptitude',
    text: 'All roses are flowers. Some flowers fade quickly. Therefore:',
    options: {
      A: 'All roses fade quickly',
      B: 'Some roses may fade quickly',
      C: 'No roses fade quickly',
      D: 'All flowers are roses',
    },
    correct: 'B',
    responses: { A: 38, B: 33, C: 14, D: 15 },
  },
];

const CODING_PROBLEMS = [
  {
    id: 'prob_01',
    title: 'Two Sum',
    difficulty: 'Easy',
    marks: 50,
    totalTestCases: 10,
    // buckets: how many students passed exactly N test cases
    // index = test cases passed (0..10)
    passBuckets: [4, 3, 5, 4, 6, 8, 12, 18, 24, 19, 14],
  },
  {
    id: 'prob_02',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    marks: 50,
    totalTestCases: 10,
    passBuckets: [8, 6, 9, 11, 13, 15, 14, 10, 7, 4, 2],
  },
];


const buildStudents = () => {
  const list = [];
  for (let i = 1; i <= 180; i++) {
    const dept     = DEPTS[Math.floor(Math.random() * DEPTS.length)];
    const div      = DIVS[Math.floor(Math.random() * DIVS.length)];
    const done     = Math.random() > 0.35;
    const aptScore = done ? Math.floor(Math.random() * 22) + 4  : null;
    const techScore= done ? Math.floor(Math.random() * 22) + 4  : null;
    const total    = done ? aptScore + techScore : null;
    const alerts   = Math.floor(Math.random() * 4);
    list.push({
      id: i, dept, div,
      name: `Student ${String(i).padStart(3, '0')}`,
      roll: `21${dept}${1000 + i}`,
      status: done ? 'Submitted' : 'In Progress',
      aptScore, techScore, total,
      percentile: null,
      timeTaken: done ? Math.floor(Math.random() * 60) + 40 : null,
      alerts,
    });
  }
  // compute real percentile among submitted
  const submitted = list.filter(s => s.total !== null).sort((a, b) => a.total - b.total);
  submitted.forEach((s, idx) => {
    s.percentile = Math.round((idx / (submitted.length - 1)) * 100);
  });
  return list.sort((a, b) => (b.total ?? -1) - (a.total ?? -1));
};

// ─── SMALL HELPERS ─────────────────────────────────────────────────────────────
const Badge = ({ children, color = 'slate' }) => {
  const map = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber:   'bg-amber-50   text-amber-700   border-amber-200',
    red:     'bg-red-50     text-red-700     border-red-200',
    blue:    'bg-blue-50    text-blue-700    border-blue-200',
    purple:  'bg-purple-50  text-purple-700  border-purple-200',
    slate:   'bg-slate-100  text-slate-600   border-slate-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${map[color]}`}>
      {children}
    </span>
  );
};

const KpiCard = ({ label, value, sub, icon, color = 'blue' }) => {
  const Icon = icon;
  const accent = {
    blue:    'text-blue-600   bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber:   'text-amber-600  bg-amber-50',
    purple:  'text-purple-600 bg-purple-50',
    red:     'text-red-600    bg-red-50',
  }[color];
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className={`p-2 rounded-lg ${accent}`}><Icon size={15} /></span>
      </div>
      <p className={`text-3xl font-black ${accent.split(' ')[0]}`}>{value}</p>
      {sub && <p className="text-xs text-slate-400 font-medium">{sub}</p>}
    </div>
  );
};

// Tiny inline bar used in question analytics
const MiniBar = ({ pct, isCorrect, isMostWrong }) => {
  const fill = isCorrect ? 'bg-emerald-500' : isMostWrong ? 'bg-red-400' : 'bg-slate-300';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className={`${fill} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold w-8 text-right ${isCorrect ? 'text-emerald-600' : isMostWrong ? 'text-red-500' : 'text-slate-500'}`}>
        {pct}%
      </span>
    </div>
  );
};

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────────
export default function LiveTestMonitor({ test = { title: 'Infosys Drive — Phase 1', timeRemaining: '01:12:44' }, onBack = () => {} }) {
  const [tab,       setTab]       = useState('overview');
  const [dept,      setDept]      = useState('All');
  const [div,       setDiv]       = useState('All');
  const [section,   setSection]   = useState('All');

  const allStudents = useMemo(() => buildStudents(), []);

  const filtered = useMemo(() =>
    allStudents.filter(s =>
      (dept === 'All' || s.dept === dept) &&
      (div  === 'All' || s.div  === div)
    ), [allStudents, dept, div]);

  const submitted   = filtered.filter(s => s.status === 'Submitted');
  const inProgress  = filtered.filter(s => s.status === 'In Progress');
  const totalStudents = filtered.length || 1;
  const pctDone     = Math.round((submitted.length / totalStudents) * 100);
  const avgScore    = submitted.length
    ? Math.round(submitted.reduce((a, s) => a + s.total, 0) / submitted.length)
    : 0;
  const topScore    = submitted.length ? Math.max(...submitted.map(s => s.total)) : 0;
  const alertCount  = filtered.reduce((a, s) => a + s.alerts, 0);

  // Score distribution buckets  (out of 50 total)
  const buckets = [
    { label: '0–10',  min: 0,  max: 10  },
    { label: '11–20', min: 11, max: 20  },
    { label: '21–30', min: 21, max: 30  },
    { label: '31–40', min: 31, max: 40  },
    { label: '41–50', min: 41, max: 50  },
  ].map(b => ({
    ...b,
    count: submitted.filter(s => s.total >= b.min && s.total <= b.max).length,
  }));
  const maxBucket = Math.max(...buckets.map(b => b.count), 1);

  // Filtered questions
  const visibleQs = QUESTIONS.filter(q => section === 'All' || q.section === section);

  const handleEndExam = () => {
    if (window.confirm('Force-end the exam for all remaining students? This cannot be undone.')) {
      alert('Exam terminated. All active sessions have been auto-submitted.');
      onBack();
    }
  };

  // Tab definitions
  const tabs = [
    { id: 'overview',  label: 'Overview',           Icon: BarChart2,  active: 'bg-blue-50 text-blue-700 border-blue-200'    },
    { id: 'questions', label: 'Question Analytics', Icon: BookOpen,   active: 'bg-purple-50 text-purple-700 border-purple-200' },
    { id: 'students',  label: 'Student Leaderboard',Icon: Trophy,     active: 'bg-amber-50 text-amber-700 border-amber-200'  },
    { id: 'alerts',    label: 'Alerts',              Icon: AlertTriangle, active: 'bg-red-50 text-red-700 border-red-200'   },
  ];

  return (
    <div className="space-y-5 pb-16 animate-in slide-in-from-bottom-4 duration-300">

      {/* ── HEADER ── */}
      <div className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Live: {test.title}</h2>
                <Badge color="red">LIVE</Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs font-mono text-slate-500 flex-wrap">
                <span className="flex items-center gap-1 text-red-600 font-bold">
                  <Clock size={12} /> {test.timeRemaining} remaining
                </span>
                <span>{allStudents.length} registered · {submitted.length} submitted · {inProgress.length} active</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleEndExam}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm shadow-sm shrink-0"
          >
            <StopCircle size={16} /> End Exam For All
          </button>
        </div>
      </div>

      {/* ── GLOBAL FILTERS ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm shrink-0">
            <Filter size={15} /> Filter by:
          </div>
          <div className="flex flex-wrap gap-3 flex-1">
            <select
              value={dept}
              onChange={e => setDept(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 min-w-[140px]"
            >
              <option value="All">All Departments</option>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              value={div}
              onChange={e => setDiv(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 min-w-[130px]"
            >
              <option value="All">All Divisions</option>
              {DIVS.map(d => <option key={d} value={d}>Division {d}</option>)}
            </select>
            {tab === 'questions' && (
              <select
                value={section}
                onChange={e => setSection(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400 min-w-[150px]"
              >
                <option value="All">All Sections</option>
                <option value="aptitude">Aptitude</option>
                <option value="technical">Technical</option>
              </select>
            )}
          </div>
          <div className="text-xs text-slate-400 font-medium shrink-0">
            Showing {filtered.length} of {allStudents.length} students
          </div>
        </div>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Total Students"  value={filtered.length}     icon={Users}      color="blue"    sub={`${DEPTS.length} departments`} />
        <KpiCard label="Submitted"       value={submitted.length}    icon={CheckCircle} color="emerald" sub={`${pctDone}% completion`} />
        <KpiCard label="In Progress"     value={inProgress.length}   icon={Clock}      color="amber"   sub="Active right now" />
        <KpiCard label="Avg Score"       value={`${avgScore}/50`}    icon={Target}     color="purple"  sub={`Top score: ${topScore}`} />
        <KpiCard label="Proctoring Alerts" value={alertCount}        icon={AlertOctagon} color="red"   sub="Across all students" />
      </div>

      {/* ── TABS ── */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex gap-1 overflow-x-auto">
        {tabs.map(({ id, label, Icon, active }) => {
          const TabIcon = Icon;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`
                flex-1 whitespace-nowrap flex items-center justify-center gap-2 px-4 py-2.5
                text-sm font-bold rounded-lg transition-all border
                ${tab === id ? active + ' shadow-sm' : 'text-slate-500 hover:bg-slate-50 border-transparent'}
              `}
            >
              <TabIcon size={15} /> {label}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════════════ */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Submission status by division */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1 text-base">Submission Status by Division</h3>
            <p className="text-xs text-slate-400 mb-5">
              {dept === 'All' ? 'Select a department above to see division-wise breakdown' : `${dept} department · all divisions`}
            </p>

            {dept === 'All' ? (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Filter size={18} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">Select a department first</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Division-wise analysis is only meaningful within a single department.
                    <br />Choose CSE, IT, ECE, or MECH from the filter above.
                  </p>
                </div>
                <div className="flex gap-2 mt-1 flex-wrap justify-center">
                  {DEPTS.map(d => (
                    <button
                      key={d}
                      onClick={() => setDept(d)}
                      className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 rounded-lg transition-colors"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="space-y-5">
                  {DIVS.map(d => {
                    const divStudents = filtered.filter(s => s.div === d);
                    const divSub      = divStudents.filter(s => s.status === 'Submitted').length;
                    const total       = divStudents.length || 1;
                    const pct         = Math.round((divSub / total) * 100);
                    const inProg      = divStudents.length - divSub;
                    const divAvg      = divSub > 0
                      ? Math.round(divStudents.filter(s => s.total !== null).reduce((a, s) => a + s.total, 0) / divSub)
                      : 0;
                    return (
                      <div key={d}>
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <span className="text-sm font-black text-slate-700">Div {d}</span>
                            <span className="ml-2 text-xs text-slate-400">{divStudents.length} students</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-bold">
                            <span className="text-emerald-600">{divSub} done</span>
                            <span className="text-amber-600">{inProg} active</span>
                            {divSub > 0 && <span className="text-purple-600">avg {divAvg}/50</span>}
                            <span className="text-slate-600">{pct}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                          <div
                            className="bg-emerald-500 h-3 transition-all duration-700 rounded-l-full"
                            style={{ width: `${pct}%` }}
                          />
                          <div
                            className="bg-amber-400 h-3 transition-all duration-700"
                            style={{ width: `${100 - pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-5 mt-6 pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Submitted</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400 inline-block" /> In Progress</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-400 inline-block" /> Avg shown per division</span>
                </div>
              </>
            )}
          </div>

          {/* Score distribution */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1 text-base">Score Distribution</h3>
            <p className="text-xs text-slate-400 mb-5">Submitted students only · out of 50</p>
            {submitted.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-slate-400 text-sm font-medium border border-dashed border-slate-200 rounded-xl">
                No submissions yet
              </div>
            ) : (
              <div className="flex items-end gap-2" style={{ height: '160px' }}>
                {buckets.map((b, i) => {
                  const barH = maxBucket > 0 ? Math.max(Math.round((b.count / maxBucket) * 128), b.count > 0 ? 8 : 0) : 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <span className="text-xs font-bold text-blue-600 transition-opacity"
                        style={{ opacity: b.count > 0 ? 1 : 0 }}>
                        {b.count}
                      </span>
                      <div className="w-full flex items-end" style={{ height: '128px' }}>
                        <div
                          className="w-full bg-blue-500 rounded-t-md group-hover:bg-blue-600 transition-colors cursor-default"
                          style={{ height: `${barH}px` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 text-center leading-tight">{b.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dept-wise avg score */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1 text-base">Avg Score by Department</h3>
            <p className="text-xs text-slate-400 mb-6">Among submitted students</p>
            <div className="space-y-4">
              {DEPTS.map(d => {
                const deptSub = allStudents.filter(s => s.dept === d && s.total !== null);
                const avg     = deptSub.length
                  ? Math.round(deptSub.reduce((a, s) => a + s.total, 0) / deptSub.length)
                  : 0;
                const pct     = Math.round((avg / 50) * 100);
                const colorMap = { CSE: 'bg-blue-500', IT: 'bg-purple-500', ECE: 'bg-emerald-500', MECH: 'bg-amber-500' };
                return (
                  <div key={d} className="flex items-center gap-4">
                    <span className="text-sm font-black text-slate-700 w-12">{d}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`${colorMap[d] || 'bg-slate-500'} h-3 rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-black text-slate-700 w-12 text-right">{avg}/50</span>
                    <span className="text-xs text-slate-400 w-10 text-right">{deptSub.length} sub</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coding — test case pass breakdown — spans full width */}
          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-black text-slate-900 text-base">Coding Section — Test Case Pass Rate</h3>
              <Badge color="blue">Live</Badge>
            </div>
            <p className="text-xs text-slate-400 mb-6">
              Per problem: how many students passed 0 / 1–4 / 5–9 / all 10 test cases
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CODING_PROBLEMS.map(prob => {
                const total = prob.passBuckets.reduce((a, b) => a + b, 0) || 1;
                const fullPass   = prob.passBuckets[prob.totalTestCases];
                const zeroPass   = prob.passBuckets[0];
                const partialArr = prob.passBuckets.slice(1, prob.totalTestCases);
                const partial    = partialArr.reduce((a, b) => a + b, 0);
                const fullPct    = Math.round((fullPass / total) * 100);
                const zeroPct    = Math.round((zeroPass / total) * 100);
                const partPct    = Math.round((partial  / total) * 100);
                const diffColor  = { Easy: 'emerald', Medium: 'amber', Hard: 'red' }[prob.difficulty];

                return (
                  <div key={prob.id} className="border border-slate-100 rounded-xl p-5 bg-slate-50">
                    {/* Problem header */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div>
                        <p className="text-sm font-black text-slate-900">{prob.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{prob.marks} marks · {prob.totalTestCases} hidden test cases</p>
                      </div>
                      <Badge color={diffColor}>{prob.difficulty}</Badge>
                    </div>

                    {/* Summary badges */}
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                        <p className="text-lg font-black text-emerald-700">{fullPass}</p>
                        <p className="text-[10px] font-bold text-emerald-600 mt-0.5">All 10 passed</p>
                        <p className="text-[10px] text-emerald-500">{fullPct}%</p>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                        <p className="text-lg font-black text-amber-700">{partial}</p>
                        <p className="text-[10px] font-bold text-amber-600 mt-0.5">Partial (1–9)</p>
                        <p className="text-[10px] text-amber-500">{partPct}%</p>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                        <p className="text-lg font-black text-red-600">{zeroPass}</p>
                        <p className="text-[10px] font-bold text-red-500 mt-0.5">0 passed</p>
                        <p className="text-[10px] text-red-400">{zeroPct}%</p>
                      </div>
                    </div>

                    {/* Per test-case bar chart */}
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Students by test cases passed</p>
                    <div className="flex items-end gap-1" style={{ height: '64px' }}>
                      {prob.passBuckets.map((count, tc) => {
                        const maxCount = Math.max(...prob.passBuckets, 1);
                        const barH = Math.max(Math.round((count / maxCount) * 56), count > 0 ? 4 : 0);
                        const isAll  = tc === prob.totalTestCases;
                        const isZero = tc === 0;
                        const barColor = isAll ? 'bg-emerald-500' : isZero ? 'bg-red-400' : 'bg-blue-400';
                        return (
                          <div key={tc} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className="w-full flex items-end" style={{ height: '56px' }}>
                              <div
                                title={`${tc} TC passed: ${count} students`}
                                className={`w-full ${barColor} rounded-t-sm cursor-default hover:opacity-80 transition-opacity`}
                                style={{ height: `${barH}px` }}
                              />
                            </div>
                            <span className="text-[9px] font-bold text-slate-400">{tc}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 text-center">← test cases passed (0 to {prob.totalTestCases}) →</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Percentile bands */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1 text-base">Percentile Band Distribution</h3>
            <p className="text-xs text-slate-400 mb-6">How submitted students are spread</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Top 10%  (90–100)',  min: 90, color: 'emerald' },
                { label: 'Good (75–89)',        min: 75, max: 89, color: 'blue' },
                { label: 'Average (50–74)',     min: 50, max: 74, color: 'amber' },
                { label: 'Below avg (<50)',     max: 49, color: 'red' },
              ].map(band => {
                const count = submitted.filter(s => {
                  const p = s.percentile ?? 0;
                  if (band.min !== undefined && p < band.min) return false;
                  if (band.max !== undefined && p > band.max) return false;
                  return true;
                }).length;
                const pct = submitted.length ? Math.round((count / submitted.length) * 100) : 0;
                const colors = {
                  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
                  blue:    'bg-blue-50    border-blue-200    text-blue-800',
                  amber:   'bg-amber-50   border-amber-200   text-amber-800',
                  red:     'bg-red-50     border-red-200     text-red-700',
                };
                return (
                  <div key={band.label} className={`rounded-xl border p-4 ${colors[band.color]}`}>
                    <p className="text-2xl font-black">{count}</p>
                    <p className="text-xs font-bold mt-0.5 opacity-80">{band.label}</p>
                    <p className="text-xs mt-1 opacity-60">{pct}% of submitted</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB: QUESTION ANALYTICS
      ══════════════════════════════════════════════════ */}
      {tab === 'questions' && (
        <div className="space-y-4">
          {/* summary strip */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3 text-sm text-purple-800 font-medium">
            <Zap size={18} className="text-purple-500 shrink-0" />
            <span>
              Showing analytics from <strong>{submitted.length} submissions</strong>.
              Data updates as more students submit.
            </span>
          </div>

          {visibleQs.map((q, idx) => {
            const total     = Object.values(q.responses).reduce((a, b) => a + b, 0) || 1;
            const pcts      = Object.fromEntries(
              Object.entries(q.responses).map(([k, v]) => [k, Math.round((v / total) * 100)])
            );
            const wrongOpts = Object.entries(pcts)
              .filter(([k]) => k !== q.correct)
              .sort(([, a], [, b]) => b - a);
            const mostWrong = wrongOpts[0]?.[0];
            const correctPct = pcts[q.correct];
            const difficulty = correctPct >= 70 ? 'Easy' : correctPct >= 45 ? 'Medium' : 'Hard';
            const diffColor  = { Easy: 'emerald', Medium: 'amber', Hard: 'red' }[difficulty];

            return (
              <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">

                {/* question header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-5">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="shrink-0 text-xs font-black bg-slate-100 text-slate-500 px-2.5 py-1.5 rounded-lg">
                      Q{idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-slate-900 leading-relaxed">{q.text}</p>
                      <span className="text-xs text-slate-400 font-medium capitalize mt-1 inline-block">
                        Section: {q.section}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Badge color={diffColor}>{difficulty}</Badge>
                    <Badge color="emerald">{correctPct}% correct</Badge>
                    {mostWrong && <Badge color="red">Most wrong: {mostWrong}</Badge>}
                  </div>
                </div>

                {/* options breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['A', 'B', 'C', 'D'].map(opt => {
                    const isCorrect  = opt === q.correct;
                    const isMostWrong= opt === mostWrong;
                    const pct        = pcts[opt] ?? 0;
                    return (
                      <div
                        key={opt}
                        className={`rounded-xl border p-4 ${
                          isCorrect   ? 'bg-emerald-50 border-emerald-200' :
                          isMostWrong ? 'bg-red-50     border-red-200'     :
                                        'bg-slate-50  border-slate-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black w-5 h-5 flex items-center justify-center rounded ${
                              isCorrect   ? 'bg-emerald-500 text-white' :
                              isMostWrong ? 'bg-red-400     text-white' :
                                            'bg-slate-200  text-slate-600'
                            }`}>
                              {opt}
                            </span>
                            <span className="text-xs text-slate-700 font-medium leading-snug">{q.options[opt]}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {isCorrect   && <span className="text-emerald-500 text-xs">✓</span>}
                            {isMostWrong && <span className="text-red-400    text-xs">↑</span>}
                          </div>
                        </div>
                        <MiniBar pct={pct} isCorrect={isCorrect} isMostWrong={isMostWrong} />
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          {q.responses[opt]} students · {pct}%
                          {isCorrect   && ' · correct answer'}
                          {isMostWrong && ' · most chosen wrong'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {visibleQs.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 font-medium">
              No questions found for the selected section.
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB: STUDENT LEADERBOARD
      ══════════════════════════════════════════════════ */}
      {tab === 'students' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div>
              <h3 className="font-black text-slate-900">Student Leaderboard</h3>
              <p className="text-xs text-slate-400 mt-0.5">{filtered.length} students · ranked by total score</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge color="emerald">{submitted.length} submitted</Badge>
              <Badge color="amber">{inProgress.length} active</Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-400 tracking-wider">
                  <th className="px-5 py-3.5 w-16">Rank</th>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Dept / Div</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-center">Aptitude</th>
                  <th className="px-5 py-3.5 text-center">Technical</th>
                  <th className="px-5 py-3.5 text-center">Total</th>
                  <th className="px-5 py-3.5 text-center">Percentile</th>
                  <th className="px-5 py-3.5 text-center">Time Taken</th>
                  <th className="px-5 py-3.5 text-center">Alerts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((s, idx) => {
                  const isTop3  = idx < 3 && s.status === 'Submitted';
                  const medals  = ['🥇', '🥈', '🥉'];
                  const rankColor = idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-300';
                  return (
                    <tr key={s.id} className={`hover:bg-slate-50 transition-colors ${isTop3 ? 'bg-amber-50/30' : ''}`}>
                      <td className="px-5 py-3.5">
                        <span className={`font-black text-sm ${rankColor}`}>
                          {isTop3 ? medals[idx] : `#${idx + 1}`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                        <p className="text-xs font-mono text-slate-400">{s.roll}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-600 text-xs">{s.dept}</span>
                        <span className="text-slate-400 text-xs"> / Div {s.div}</span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {s.status === 'Submitted'
                          ? <Badge color="emerald">Submitted</Badge>
                          : <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-md text-xs font-bold animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                              Active
                            </span>
                        }
                      </td>
                      <td className="px-5 py-3.5 text-center font-black text-slate-700">
                        {s.aptScore !== null ? s.aptScore : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-center font-black text-slate-700">
                        {s.techScore !== null ? s.techScore : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`font-black text-base ${s.total !== null ? 'text-slate-900' : 'text-slate-300'}`}>
                          {s.total !== null ? s.total : '—'}
                        </span>
                        {s.total !== null && <span className="text-xs text-slate-400">/50</span>}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {s.percentile !== null ? (
                          <span className={`font-black text-sm ${
                            s.percentile >= 90 ? 'text-emerald-600' :
                            s.percentile >= 75 ? 'text-blue-600'    :
                            s.percentile >= 50 ? 'text-amber-600'   : 'text-red-500'
                          }`}>
                            {s.percentile}th
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-center text-xs font-mono text-slate-500">
                        {s.timeTaken !== null ? `${s.timeTaken}m` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {s.alerts > 0
                          ? <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600">
                              <AlertOctagon size={12} /> {s.alerts}
                            </span>
                          : <span className="text-slate-300 text-xs">—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-slate-400 font-medium">
                      No students match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          TAB: ALERTS
      ══════════════════════════════════════════════════ */}
      {tab === 'alerts' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-sm text-red-800 font-medium">
            <Shield size={18} className="text-red-500 shrink-0 mt-0.5" />
            <span>
              Proctoring alerts are triggered by tab switches, copy-paste attempts, and focus loss.
              Students with 2+ alerts are highlighted.
            </span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="font-black text-slate-900">Alert Log</h3>
              <Badge color="red">{alertCount} total alerts</Badge>
            </div>
            <div className="divide-y divide-slate-100">
              {filtered
                .filter(s => s.alerts > 0)
                .sort((a, b) => b.alerts - a.alerts)
                .map(s => (
                  <div key={s.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white ${s.alerts >= 3 ? 'bg-red-500' : 'bg-amber-400'}`}>
                        {s.alerts}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                        <p className="text-xs font-mono text-slate-400">{s.roll} · {s.dept} / Div {s.div}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.alerts >= 3 && <Badge color="red">High risk</Badge>}
                      {s.alerts === 2 && <Badge color="amber">Watch</Badge>}
                      {s.alerts === 1 && <Badge color="slate">Low</Badge>}
                      <span className="text-xs text-slate-400">{s.status}</span>
                    </div>
                  </div>
                ))}
              {filtered.filter(s => s.alerts > 0).length === 0 && (
                <div className="px-6 py-12 text-center text-slate-400 font-medium">
                  No alerts for the selected filters.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}