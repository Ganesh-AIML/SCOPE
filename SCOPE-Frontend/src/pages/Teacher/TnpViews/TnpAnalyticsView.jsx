import { useState, useMemo } from 'react';
import {
  ArrowLeft, Users, CheckCircle, Target, Trophy,
  BookOpen, Code2, BrainCircuit, BarChart2, Download,
  Filter, TrendingUp, Award, AlertOctagon, Database, SlidersHorizontal, Search
} from 'lucide-react';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DEPTS = ['CSE', 'IT', 'ECE', 'MECH'];
const DIVS  = ['A', 'B', 'C', 'D'];

const APT_TAGS  = ['arithmetic', 'logical', 'probability', 'verbalAbility', 'verbalReasoning'];
const TECH_TAGS = ['cn', 'dbms', 'dsa', 'oops', 'os'];
const TAG_LABELS = {
  arithmetic: 'Arithmetic',  logical: 'Logical',       probability: 'Probability',
  verbalAbility: 'Verbal Ability', verbalReasoning: 'Verbal Reasoning',
  cn: 'Networks',  dbms: 'DBMS',  dsa: 'DSA',  oops: 'OOP',  os: 'OS',
};

const QUESTIONS = [
  { id: 1, section: 'aptitude',  tag: 'arithmetic',      text: 'A train travels 60 km in 1 hr. How long for 210 km?',            options: { A: '2.5 hrs', B: '3 hrs', C: '3.5 hrs', D: '4 hrs' },          correct: 'C', responses: { A: 8,  B: 19, C: 61, D: 12 } },
  { id: 2, section: 'aptitude',  tag: 'logical',         text: 'Next number: 2, 6, 12, 20, 30, ?',                               options: { A: '40',  B: '42',  C: '44',  D: '38'  },                        correct: 'B', responses: { A: 29, B: 41, C: 18, D: 12 } },
  { id: 3, section: 'aptitude',  tag: 'probability',     text: 'Bag has 4 red, 6 blue balls. P(red) = ?',                        options: { A: '2/5', B: '3/5', C: '1/4', D: '1/2' },                        correct: 'A', responses: { A: 55, B: 20, C: 14, D: 11 } },
  { id: 4, section: 'aptitude',  tag: 'verbalAbility',   text: "Most similar to 'BENEVOLENT':",                                  options: { A: 'Cruel', B: 'Indifferent', C: 'Kind', D: 'Greedy' },          correct: 'C', responses: { A: 6,  B: 12, C: 71, D: 11 } },
  { id: 5, section: 'aptitude',  tag: 'verbalReasoning', text: 'All roses are flowers. Some flowers fade. Therefore:',           options: { A: 'All roses fade', B: 'Some may fade', C: 'None fade', D: 'All flowers are roses' }, correct: 'B', responses: { A: 38, B: 33, C: 14, D: 15 } },
  { id: 6, section: 'technical', tag: 'cn',              text: 'Which OSI layer handles end-to-end communication?',             options: { A: 'Network', B: 'Data Link', C: 'Transport', D: 'Session' },     correct: 'C', responses: { A: 14, B: 9,  C: 62, D: 15 } },
  { id: 7, section: 'technical', tag: 'dbms',            text: 'Which normal form eliminates transitive dependencies?',         options: { A: '1NF', B: '2NF', C: '3NF', D: 'BCNF' },                       correct: 'C', responses: { A: 7,  B: 18, C: 57, D: 18 } },
  { id: 8, section: 'technical', tag: 'dsa',             text: 'Time complexity of Binary Search on N elements?',               options: { A: 'O(N)', B: 'O(N log N)', C: 'O(log N)', D: 'O(1)' },          correct: 'C', responses: { A: 5,  B: 14, C: 74, D: 7  } },
  { id: 9, section: 'technical', tag: 'oops',            text: 'Which principle allows subclass to override a parent method?',  options: { A: 'Encapsulation', B: 'Abstraction', C: 'Overloading', D: 'Overriding' }, correct: 'D', responses: { A: 8, B: 12, C: 22, D: 58 } },
  { id: 10, section: 'technical', tag: 'os',             text: "Which page replacement has Belady's Anomaly?",                  options: { A: 'LRU', B: 'Optimal', C: 'FIFO', D: 'LFU' },                   correct: 'C', responses: { A: 22, B: 11, C: 43, D: 24 } },
];

const CODING_PROBLEMS = [
  { id: 'p1', title: 'Two Sum',                                   difficulty: 'Easy',   marks: 50, totalTC: 10, passBuckets: [4,3,5,4,6,8,12,18,24,19,14] },
  { id: 'p2', title: 'Longest Substring Without Repeating Chars', difficulty: 'Medium', marks: 50, totalTC: 10, passBuckets: [8,6,9,11,13,15,14,10,7,4,2]  },
];

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const buildStudents = () => {
  const rng = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const list = [];
  for (let i = 1; i <= 298; i++) {
    const dept      = DEPTS[i % DEPTS.length];
    const div       = DIVS[Math.floor(Math.random() * DIVS.length)];
    const aptScore  = rng(4, 25);
    const techScore = rng(4, 25);
    const codScore  = rng(0, 100);
    const total     = aptScore + techScore + codScore;
    list.push({
      id: i, dept, div,
      name: `Student ${String(i).padStart(3, '0')}`,
      roll: `21${dept.substring(0,2)}${1000 + i}`,
      aptScore, techScore, codScore, total,
      percentile: null,
      timeTaken: rng(55, 118),
      alerts: rng(0, 3),
      tagScores: {
        arithmetic: rng(1,5), logical: rng(1,5), probability: rng(1,5),
        verbalAbility: rng(1,5), verbalReasoning: rng(1,5),
        cn: rng(1,5), dbms: rng(1,5), dsa: rng(1,5), oops: rng(1,5), os: rng(1,5),
      },
    });
  }
  const sorted = [...list].sort((a, b) => a.total - b.total);
  sorted.forEach((s, idx) => {
    s.percentile = Math.round((idx / (sorted.length - 1)) * 100);
  });
  return list.sort((a, b) => b.total - a.total);
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const Badge = ({ children, color = 'slate' }) => {
  const map = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber:   'bg-amber-50   text-amber-700   border-amber-200',
    red:     'bg-red-50     text-red-700     border-red-200',
    blue:    'bg-blue-50    text-blue-700    border-blue-200',
    purple:  'bg-purple-50  text-purple-700  border-purple-200',
    slate:   'bg-slate-100  text-slate-600   border-slate-200',
    indigo:  'bg-indigo-50  text-indigo-700  border-indigo-200',
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
    blue:    'text-blue-600    bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber:   'text-amber-600   bg-amber-50',
    purple:  'text-purple-600  bg-purple-50',
    red:     'text-red-600     bg-red-50',
    indigo:  'text-indigo-600  bg-indigo-50',
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

const MiniBar = ({ pct, isCorrect, isMostWrong }) => {
  const fill = isCorrect ? 'bg-emerald-500' : isMostWrong ? 'bg-red-400' : 'bg-slate-300';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className={`${fill} h-2 rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-bold w-8 text-right ${isCorrect ? 'text-emerald-600' : isMostWrong ? 'text-red-500' : 'text-slate-500'}`}>
        {pct}%
      </span>
    </div>
  );
};

const exportToExcel = (students, testTitle) => {
  const headers = ['Rank','Name','Roll No','Dept','Div','Aptitude (/25)','Technical (/25)','Coding (/100)','Total (/150)','Percentile','Time Taken (min)','Qualified','Alerts'];
  const rows = students.map((s, idx) => [
    idx + 1, s.name, s.roll, s.dept, s.div,
    s.aptScore, s.techScore, s.codScore, s.total,
    s.percentile + 'th', s.timeTaken,
    s.qualified ? 'Yes' : 'No', s.alerts
  ]);

  let csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${testTitle.replace(/\s+/g, '_')}_Results.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const ScoreDistChart = ({ students, scoreKey, maxScore, label }) => {
  const step   = Math.ceil(maxScore / 5);
  const buckets = Array.from({ length: 5 }, (_, i) => {
    const min = i * step;
    const max = i === 4 ? maxScore : (i + 1) * step - 1;
    return { label: `${min}–${max}`, count: students.filter(s => s[scoreKey] >= min && s[scoreKey] <= max).length };
  });
  const peak = Math.max(...buckets.map(b => b.count), 1);
  return (
    <div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">{label}</p>
      <div className="flex items-end gap-1.5" style={{ height: '80px' }}>
        {buckets.map((b, i) => {
          const h = Math.max(Math.round((b.count / peak) * 64), b.count > 0 ? 4 : 0);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <span className="text-[10px] font-bold text-blue-600" style={{ opacity: b.count > 0 ? 1 : 0 }}>{b.count}</span>
              <div className="w-full flex items-end" style={{ height: '64px' }}>
                <div className="w-full bg-blue-500 rounded-t-sm group-hover:bg-blue-600 transition-colors" style={{ height: `${h}px` }} />
              </div>
              <span className="text-[9px] font-bold text-slate-400 text-center leading-tight">{b.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DeptAvgBar = ({ allStudents, scoreKey, maxScore, colorClass = 'bg-blue-500' }) => {
  return (
    <div className="space-y-3">
      {DEPTS.map(d => {
        const ds  = allStudents.filter(s => s.dept === d);
        const avg = ds.length ? Math.round(ds.reduce((a, s) => a + s[scoreKey], 0) / ds.length) : 0;
        const pct = Math.round((avg / maxScore) * 100);
        return (
          <div key={d} className="flex items-center gap-3">
            <span className="text-xs font-black text-slate-600 w-10">{d}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-black text-slate-700 w-16 text-right">{avg}/{maxScore}</span>
            <span className="text-[10px] text-slate-400 w-10">{ds.length} stu</span>
          </div>
        );
      })}
    </div>
  );
};

const TagAccuracyBar = ({ allStudents, tags, colorClass = 'bg-indigo-500', maxPerTag = 5 }) => {
  return (
    <div className="space-y-3">
      {tags.map(tag => {
        const avg = allStudents.length
          ? (allStudents.reduce((a, s) => a + (s.tagScores[tag] || 0), 0) / allStudents.length)
          : 0;
        const pct = Math.round((avg / maxPerTag) * 100);
        return (
          <div key={tag} className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600 w-28 shrink-0">{TAG_LABELS[tag]}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-black text-slate-700 w-10 text-right">{avg.toFixed(1)}/{maxPerTag}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── UPGRADED LEADERBOARD TABLE WITH SEARCH ───
const LeaderboardTable = ({ students, scoreKey, maxScore, scoreLabel, showSections = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const medals = ['🥇', '🥈', '🥉'];

  // Add the original rank to each student BEFORE filtering so their true rank is preserved
  const studentsWithRank = useMemo(() => {
    return students.map((s, i) => ({ ...s, rank: i + 1 }));
  }, [students]);

  const filteredList = useMemo(() => {
    if (!searchTerm) return studentsWithRank;
    const lower = searchTerm.toLowerCase();
    return studentsWithRank.filter(s => 
      s.name.toLowerCase().includes(lower) || 
      s.roll.toLowerCase().includes(lower)
    );
  }, [studentsWithRank, searchTerm]);

  return (
    <div className="flex flex-col">
      {/* SEARCH BAR HEADER */}
      <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search student by name or roll no..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Showing {Math.min(filteredList.length, 50)} of {filteredList.length}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-400 tracking-wider">
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Dept / Div</th>
              {showSections && <>
                <th className="px-4 py-3 text-center">Apt</th>
                <th className="px-4 py-3 text-center">Tech</th>
                <th className="px-4 py-3 text-center">Coding</th>
              </>}
              <th className="px-4 py-3 text-center">{scoreLabel}</th>
              <th className="px-4 py-3 text-center">Percentile</th>
              <th className="px-4 py-3 text-center">Qualified</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredList.slice(0, 50).map((s) => (
              <tr key={s.id} className={`hover:bg-slate-50 transition-colors ${s.rank <= 3 ? 'bg-amber-50/40' : ''}`}>
                <td className="px-4 py-3">
                  <span className={`font-black text-sm ${s.rank === 1 ? 'text-amber-500' : s.rank === 2 ? 'text-slate-400' : s.rank === 3 ? 'text-amber-700' : 'text-slate-400'}`}>
                    {s.rank <= 3 ? medals[s.rank - 1] : `#${s.rank}`}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                  <p className="text-xs font-mono text-slate-500">{s.roll}</p>
                </td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600">{s.dept} / Div {s.div}</td>
                {showSections && <>
                  <td className="px-4 py-3 text-center font-bold text-indigo-700 text-xs">{s.aptScore}</td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-700 text-xs">{s.techScore}</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-700 text-xs">{s.codScore}</td>
                </>}
                <td className="px-4 py-3 text-center">
                  <span className="font-black text-slate-900">{s[scoreKey]}</span>
                  <span className="text-xs text-slate-400">/{maxScore}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-black text-sm ${s.percentile >= 90 ? 'text-emerald-600' : s.percentile >= 75 ? 'text-blue-600' : s.percentile >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                    {s.percentile}th
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {s.qualified ? <Badge color="emerald">Yes</Badge> : <Badge color="red">No</Badge>}
                </td>
              </tr>
            ))}
            {filteredList.length === 0 && (
              <tr>
                <td colSpan={showSections ? "9" : "6"} className="p-8 text-center text-slate-500 font-medium">
                  No students found matching "{searchTerm}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filteredList.length > 50 && (
          <p className="text-xs text-slate-400 text-center py-3 border-t border-slate-100">
            Showing top 50 search results
          </p>
        )}
      </div>
    </div>
  );
};

const QuestionCard = ({ q, idx }) => {
  const total    = Object.values(q.responses).reduce((a, b) => a + b, 0) || 1;
  const pcts     = Object.fromEntries(Object.entries(q.responses).map(([k, v]) => [k, Math.round((v / total) * 100)]));
  const wrongOpts = Object.entries(pcts).filter(([k]) => k !== q.correct).sort(([, a], [, b]) => b - a);
  const mostWrong = wrongOpts[0]?.[0];
  const correctPct = pcts[q.correct];
  const difficulty = correctPct >= 70 ? 'Easy' : correctPct >= 45 ? 'Medium' : 'Hard';
  const diffColor  = { Easy: 'emerald', Medium: 'amber', Hard: 'red' }[difficulty];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className="shrink-0 text-xs font-black bg-slate-100 text-slate-500 px-2.5 py-1.5 rounded-lg">Q{idx + 1}</span>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-relaxed">{q.text}</p>
            <span className="text-xs text-slate-400 capitalize mt-0.5 inline-block">{TAG_LABELS[q.tag]}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Badge color={diffColor}>{difficulty}</Badge>
          <Badge color="emerald">{correctPct}% correct</Badge>
          {mostWrong && <Badge color="red">Most wrong: {mostWrong}</Badge>}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {['A','B','C','D'].map(opt => {
          const isCorrect   = opt === q.correct;
          const isMostWrong = opt === mostWrong;
          const pct         = pcts[opt] ?? 0;
          return (
            <div key={opt} className={`rounded-xl border p-3 ${isCorrect ? 'bg-emerald-50 border-emerald-200' : isMostWrong ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-black w-5 h-5 flex items-center justify-center rounded shrink-0 ${isCorrect ? 'bg-emerald-500 text-white' : isMostWrong ? 'bg-red-400 text-white' : 'bg-slate-200 text-slate-600'}`}>{opt}</span>
                <span className="text-xs text-slate-700 font-medium leading-snug">{q.options[opt]}</span>
              </div>
              <MiniBar pct={pct} isCorrect={isCorrect} isMostWrong={isMostWrong} />
              <p className="text-[10px] text-slate-400 mt-1">{q.responses[opt]} students · {pct}%{isCorrect ? ' · correct' : isMostWrong ? ' · most wrong' : ''}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function TnpAnalyticsView({ selectedTest, setSelectedTest }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [dept, setDept]     = useState('All');
  const [div,  setDiv]      = useState('All');

  const [cutoffs, setCutoffs] = useState({
    overall: 90,
    coding: 50,
    aptitude: 0,
    technical: 0
  });

  const baseStudents = useMemo(() => buildStudents(), []);

  const allStudents = useMemo(() => {
    return baseStudents.map(s => ({
      ...s,
      qualified: (s.total >= cutoffs.overall) &&
                 (s.codScore >= cutoffs.coding) &&
                 (s.aptScore >= cutoffs.aptitude) &&
                 (s.techScore >= cutoffs.technical)
    }));
  }, [baseStudents, cutoffs]);

  const filtered = useMemo(() =>
    allStudents.filter(s =>
      (dept === 'All' || s.dept === dept) &&
      (div  === 'All' || s.div  === div)
    ), [allStudents, dept, div]);

  // ── global stats (always off full allStudents, not filtered) ──
  const qualified   = allStudents.filter(s => s.qualified);
  const topScore    = allStudents[0]?.total ?? 0;
  
  const avgTotal    = Math.round(allStudents.reduce((a, s) => a + s.total, 0) / allStudents.length);
  const avgApt      = Math.round(allStudents.reduce((a, s) => a + s.aptScore, 0) / allStudents.length);
  const avgTech     = Math.round(allStudents.reduce((a, s) => a + s.techScore, 0) / allStudents.length);
  const avgCod      = Math.round(allStudents.reduce((a, s) => a + s.codScore, 0) / allStudents.length);

  // leaderboards sorted by specific section
  const aptLB  = [...allStudents].sort((a, b) => b.aptScore  - a.aptScore);
  const techLB = [...allStudents].sort((a, b) => b.techScore - a.techScore);
  const codLB  = [...allStudents].sort((a, b) => b.codScore  - a.codScore);

  const testTitle = selectedTest?.title ?? 'TCS NQT Mock Assessment';

  const SECTIONS = [
    { id: 'overview',  label: 'Overview',          icon: BarChart2,    color: 'bg-blue-50 text-blue-700 border-blue-200'    },
    { id: 'aptitude',  label: 'Aptitude',           icon: BrainCircuit, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 'technical', label: 'Technical',          icon: Database,     color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: 'coding',    label: 'Coding',             icon: Code2,        color: 'bg-blue-50 text-blue-700 border-blue-200'    },
    { id: 'overall',   label: 'Overall Leaderboard',icon: Trophy,       color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'questions', label: 'Question Analysis',  icon: BookOpen,     color: 'bg-purple-50 text-purple-700 border-purple-200' },
  ];

  return (
    <div className="space-y-5 pb-16 animate-in slide-in-from-bottom-4 duration-300">

      {/* ── HEADER ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedTest(null)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">{testTitle}</h2>
                <Badge color="slate">Completed</Badge>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {allStudents.length} students appeared · {qualified.length} qualified · Total: 150 marks
              </p>
            </div>
          </div>
          <button
            onClick={() => exportToExcel(allStudents, testTitle)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all text-sm shadow-sm shrink-0"
          >
            <Download size={16} /> Export Results (.csv)
          </button>
        </div>
      </div>

      {/* ── GLOBAL FILTERS & CUTOFF SETTINGS ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-600 font-bold text-sm shrink-0 w-32">
            <Filter size={15} /> Student Filter:
          </div>
          <div className="flex flex-wrap gap-3 flex-1">
            <select value={dept} onChange={e => { setDept(e.target.value); setDiv('All'); }}
              className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 min-w-[150px]">
              <option value="All">All Departments</option>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={div} onChange={e => setDiv(e.target.value)}
              disabled={dept === 'All'}
              className="bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 min-w-[140px] disabled:opacity-40 disabled:cursor-not-allowed">
              <option value="All">All Divisions</option>
              {DIVS.map(d => <option key={d} value={d}>Division {d}</option>)}
            </select>
          </div>
          <span className="text-xs text-slate-400 font-medium shrink-0">
            {filtered.length} of {allStudents.length} students
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm shrink-0 w-32">
            <SlidersHorizontal size={15} /> Set Cutoffs:
          </div>
          <div className="flex flex-wrap gap-4 flex-1">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Overall (/150)</label>
              <input type="number" value={cutoffs.overall} onChange={e => setCutoffs({...cutoffs, overall: Number(e.target.value) || 0})} className="w-16 bg-white border border-indigo-200 rounded text-sm font-black text-indigo-700 px-2 py-1 focus:outline-none focus:border-indigo-500 text-center"/>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Coding (/100)</label>
              <input type="number" value={cutoffs.coding} onChange={e => setCutoffs({...cutoffs, coding: Number(e.target.value) || 0})} className="w-16 bg-white border border-indigo-200 rounded text-sm font-black text-indigo-700 px-2 py-1 focus:outline-none focus:border-indigo-500 text-center"/>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Aptitude (/25)</label>
              <input type="number" value={cutoffs.aptitude} onChange={e => setCutoffs({...cutoffs, aptitude: Number(e.target.value) || 0})} className="w-16 bg-white border border-indigo-200 rounded text-sm font-black text-indigo-700 px-2 py-1 focus:outline-none focus:border-indigo-500 text-center"/>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Technical (/25)</label>
              <input type="number" value={cutoffs.technical} onChange={e => setCutoffs({...cutoffs, technical: Number(e.target.value) || 0})} className="w-16 bg-white border border-indigo-200 rounded text-sm font-black text-indigo-700 px-2 py-1 focus:outline-none focus:border-indigo-500 text-center"/>
            </div>
          </div>
        </div>
      </div>

      {/* ── TOP-LEVEL KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <KpiCard label="Appeared"     value={allStudents.length} icon={Users}      color="blue"    sub="Total students" />
        <KpiCard label="Qualified"    value={qualified.length}   icon={CheckCircle} color="emerald" sub={`${Math.round((qualified.length/allStudents.length)*100)}% pass rate`} />
        <KpiCard label="Top Score"    value={topScore}           icon={Award}      color="amber"   sub="out of 150" />
        <KpiCard label="Avg Aptitude" value={`${avgApt}/25`}     icon={BrainCircuit} color="indigo" sub="Section average" />
        <KpiCard label="Avg Technical" value={`${avgTech}/25`}  icon={Database}   color="purple"  sub="Section average" />
        <KpiCard label="Avg Coding"   value={`${avgCod}/100`}   icon={Code2}      color="blue"    sub="Section average" />
      </div>

      {/* ── SECTION TABS ── */}
      <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex gap-1 overflow-x-auto">
        {SECTIONS.map(({ id, label, icon, color }) => {
          const SectionIcon = icon;
          return (
            <button key={id} onClick={() => setActiveSection(id)}
              className={`flex-1 whitespace-nowrap flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all border
                ${activeSection === id ? color + ' shadow-sm' : 'text-slate-500 hover:bg-slate-50 border-transparent'}`}>
              <SectionIcon size={14} /> {label}
            </button>
          );
        })}
      </div>

      {/* ════════════════════════════════════════
          OVERVIEW
      ════════════════════════════════════════ */}
      {activeSection === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Section Avg by Department</h3>
            <p className="text-xs text-slate-400 mb-5">Aptitude · Technical · Coding across all depts</p>
            <div className="space-y-6">
              {DEPTS.map(d => {
                const ds     = allStudents.filter(s => s.dept === d);
                const n      = ds.length || 1;
                const apt    = Math.round(ds.reduce((a, s) => a + s.aptScore,  0) / n);
                const tech   = Math.round(ds.reduce((a, s) => a + s.techScore, 0) / n);
                const cod    = Math.round(ds.reduce((a, s) => a + s.codScore,  0) / n);
                return (
                  <div key={d}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-black text-slate-700">{d}</span>
                      <span className="text-xs text-slate-400">{ds.length} students</span>
                    </div>
                    <div className="space-y-1.5">
                      {[
                        { label: 'Apt',  val: apt,  max: 25,  color: 'bg-indigo-500' },
                        { label: 'Tech', val: tech, max: 25,  color: 'bg-emerald-500' },
                        { label: 'Cod',  val: cod,  max: 100, color: 'bg-blue-500' },
                      ].map(row => (
                        <div key={row.label} className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 w-6">{row.label}</span>
                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className={`${row.color} h-2 rounded-full`} style={{ width: `${Math.round((row.val/row.max)*100)}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-600 w-12 text-right">{row.val}/{row.max}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Score Distribution (Overall)</h3>
            <p className="text-xs text-slate-400 mb-5">All {filtered.length} filtered students · out of 150</p>
            <ScoreDistChart students={filtered} scoreKey="total" maxScore={150} label="Total score bands" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Percentile Band Distribution</h3>
            <p className="text-xs text-slate-400 mb-5">Among all {allStudents.length} students</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Top 10% (90–100)', min: 90, color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
                { label: 'Good (75–89)',      min: 75, max: 89, color: 'bg-blue-50 border-blue-200 text-blue-800' },
                { label: 'Average (50–74)',   min: 50, max: 74, color: 'bg-amber-50 border-amber-200 text-amber-800' },
                { label: 'Below avg (<50)',   max: 49, color: 'bg-red-50 border-red-200 text-red-700' },
              ].map(band => {
                const count = allStudents.filter(s => {
                  const p = s.percentile ?? 0;
                  if (band.min !== undefined && p < band.min) return false;
                  if (band.max !== undefined && p > band.max) return false;
                  return true;
                }).length;
                const pct = Math.round((count / allStudents.length) * 100);
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

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Qualification Summary</h3>
            <p className="text-xs text-slate-400 mb-5">
              Cutoffs: Overall ≥ {cutoffs.overall} | Coding ≥ {cutoffs.coding} | Apt ≥ {cutoffs.aptitude} | Tech ≥ {cutoffs.technical}
            </p>
            <div className="space-y-4">
              {DEPTS.map(d => {
                const ds   = filtered.filter(s => s.dept === d);
                const qual = ds.filter(s => s.qualified).length;
                const pct  = ds.length ? Math.round((qual / ds.length) * 100) : 0;
                return (
                  <div key={d}>
                    <div className="flex justify-between items-end mb-1.5">
                      <span className="text-sm font-black text-slate-700">{d}</span>
                      <div className="flex gap-3 text-xs font-bold">
                        <span className="text-emerald-600">{qual} qualified</span>
                        <span className="text-red-500">{ds.length - qual} not</span>
                        <span className="text-slate-500">{pct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                      <div className="bg-emerald-500 h-3 rounded-l-full" style={{ width: `${pct}%` }} />
                      <div className="bg-red-300 h-3" style={{ width: `${100 - pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          APTITUDE SECTION
      ════════════════════════════════════════ */}
      {activeSection === 'aptitude' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Aptitude — Dept-wise Avg</h3>
            <p className="text-xs text-slate-400 mb-5">Out of 25 marks</p>
            <DeptAvgBar allStudents={filtered} scoreKey="aptScore" maxScore={25} colorClass="bg-indigo-500" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Topic-wise Accuracy</h3>
            <p className="text-xs text-slate-400 mb-5">Avg score per topic (out of 5)</p>
            <TagAccuracyBar allStudents={filtered} tags={APT_TAGS} colorClass="bg-indigo-500" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Aptitude — Division Breakdown</h3>
            <p className="text-xs text-slate-400 mb-5">{dept === 'All' ? 'Select a department to see division detail' : `${dept} · all divisions`}</p>
            {dept === 'All' ? (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center gap-3 text-center">
                <Filter size={20} className="text-slate-300" />
                <p className="text-sm font-bold text-slate-600">Select a department first</p>
                <p className="text-xs text-slate-400">Division analysis only makes sense within one department.</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {DEPTS.map(d => (
                    <button key={d} onClick={() => setDept(d)}
                      className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-600 rounded-lg transition-colors">
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {DIVS.map(d => {
                  const ds  = filtered.filter(s => s.div === d);
                  const avg = ds.length ? Math.round(ds.reduce((a, s) => a + s.aptScore, 0) / ds.length) : 0;
                  const pct = Math.round((avg / 25) * 100);
                  return (
                    <div key={d} className="flex items-center gap-3">
                      <span className="text-sm font-black text-slate-700 w-10">Div {d}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-black text-slate-700 w-12 text-right">{avg}/25</span>
                      <span className="text-[10px] text-slate-400 w-12">{ds.length} stu</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Aptitude Score Distribution</h3>
            <p className="text-xs text-slate-400 mb-5">Filtered students · out of 25</p>
            <ScoreDistChart students={filtered} scoreKey="aptScore" maxScore={25} label="Score bands" />
          </div>

          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-indigo-50">
              <div>
                <h3 className="font-black text-slate-900">Aptitude Leaderboard</h3>
                <p className="text-xs text-slate-400 mt-0.5">Top performers by aptitude score</p>
              </div>
              <Badge color="indigo">Top 50 shown</Badge>
            </div>
            <LeaderboardTable students={aptLB} scoreKey="aptScore" maxScore={25} scoreLabel="Apt Score" />
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          TECHNICAL SECTION
      ════════════════════════════════════════ */}
      {activeSection === 'technical' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Technical — Dept-wise Avg</h3>
            <p className="text-xs text-slate-400 mb-5">Out of 25 marks</p>
            <DeptAvgBar allStudents={filtered} scoreKey="techScore" maxScore={25} colorClass="bg-emerald-500" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Subject-wise Accuracy</h3>
            <p className="text-xs text-slate-400 mb-5">Avg score per subject (out of 5)</p>
            <TagAccuracyBar allStudents={filtered} tags={TECH_TAGS} colorClass="bg-emerald-500" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Technical — Division Breakdown</h3>
            <p className="text-xs text-slate-400 mb-5">{dept === 'All' ? 'Select a department to see division detail' : `${dept} · all divisions`}</p>
            {dept === 'All' ? (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center gap-3 text-center">
                <Filter size={20} className="text-slate-300" />
                <p className="text-sm font-bold text-slate-600">Select a department first</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {DEPTS.map(d => (
                    <button key={d} onClick={() => setDept(d)}
                      className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:border-emerald-400 hover:text-emerald-600 text-slate-600 rounded-lg transition-colors">
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {DIVS.map(d => {
                  const ds  = filtered.filter(s => s.div === d);
                  const avg = ds.length ? Math.round(ds.reduce((a, s) => a + s.techScore, 0) / ds.length) : 0;
                  const pct = Math.round((avg / 25) * 100);
                  return (
                    <div key={d} className="flex items-center gap-3">
                      <span className="text-sm font-black text-slate-700 w-10">Div {d}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-black text-slate-700 w-12 text-right">{avg}/25</span>
                      <span className="text-[10px] text-slate-400 w-12">{ds.length} stu</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Technical Score Distribution</h3>
            <p className="text-xs text-slate-400 mb-5">Filtered students · out of 25</p>
            <ScoreDistChart students={filtered} scoreKey="techScore" maxScore={25} label="Score bands" />
          </div>

          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50">
              <div>
                <h3 className="font-black text-slate-900">Technical Leaderboard</h3>
                <p className="text-xs text-slate-400 mt-0.5">Top performers by technical score</p>
              </div>
              <Badge color="emerald">Top 50 shown</Badge>
            </div>
            <LeaderboardTable students={techLB} scoreKey="techScore" maxScore={25} scoreLabel="Tech Score" />
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          CODING SECTION
      ════════════════════════════════════════ */}
      {activeSection === 'coding' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Coding — Dept-wise Avg</h3>
            <p className="text-xs text-slate-400 mb-5">Out of 100 marks</p>
            <DeptAvgBar allStudents={filtered} scoreKey="codScore" maxScore={100} colorClass="bg-blue-500" />
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Coding Score Distribution</h3>
            <p className="text-xs text-slate-400 mb-5">Filtered students · out of 100</p>
            <ScoreDistChart students={filtered} scoreKey="codScore" maxScore={100} label="Score bands" />
          </div>

          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Test Case Pass Rate — Per Problem</h3>
            <p className="text-xs text-slate-400 mb-6">How many students passed 0 / partial / all test cases</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {CODING_PROBLEMS.map(prob => {
                const total    = prob.passBuckets.reduce((a, b) => a + b, 0) || 1;
                const fullPass = prob.passBuckets[prob.totalTC];
                const zeroPass = prob.passBuckets[0];
                const partial  = prob.passBuckets.slice(1, prob.totalTC).reduce((a, b) => a + b, 0);
                const diffColor = { Easy: 'emerald', Medium: 'amber', Hard: 'red' }[prob.difficulty];
                return (
                  <div key={prob.id} className="border border-slate-100 rounded-xl p-5 bg-slate-50">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div>
                        <p className="text-sm font-black text-slate-900">{prob.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{prob.marks} marks · {prob.totalTC} test cases</p>
                      </div>
                      <Badge color={diffColor}>{prob.difficulty}</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: 'All passed', val: fullPass, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                        { label: 'Partial',    val: partial,  color: 'bg-amber-50   border-amber-200   text-amber-700'   },
                        { label: '0 passed',   val: zeroPass, color: 'bg-red-50     border-red-200     text-red-700'     },
                      ].map(b => (
                        <div key={b.label} className={`rounded-lg border p-3 text-center ${b.color}`}>
                          <p className="text-lg font-black">{b.val}</p>
                          <p className="text-[10px] font-bold mt-0.5">{b.label}</p>
                          <p className="text-[10px] opacity-70">{Math.round((b.val/total)*100)}%</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Students by test cases passed</p>
                    <div className="flex items-end gap-1" style={{ height: '60px' }}>
                      {prob.passBuckets.map((count, tc) => {
                        const peak  = Math.max(...prob.passBuckets, 1);
                        const h     = Math.max(Math.round((count / peak) * 48), count > 0 ? 3 : 0);
                        const color = tc === prob.totalTC ? 'bg-emerald-500' : tc === 0 ? 'bg-red-400' : 'bg-blue-400';
                        return (
                          <div key={tc} className="flex-1 flex flex-col items-center gap-0.5">
                            <div className="w-full flex items-end" style={{ height: '48px' }}>
                              <div title={`${tc} TC: ${count}`} className={`w-full ${color} rounded-t-sm hover:opacity-75`} style={{ height: `${h}px` }} />
                            </div>
                            <span className="text-[8px] font-bold text-slate-400">{tc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Coding — Division Breakdown</h3>
            <p className="text-xs text-slate-400 mb-5">{dept === 'All' ? 'Select a department first' : `${dept} · all divisions`}</p>
            {dept === 'All' ? (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center gap-3 text-center">
                <Filter size={20} className="text-slate-300" />
                <p className="text-sm font-bold text-slate-600">Select a department first</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {DEPTS.map(d => (
                    <button key={d} onClick={() => setDept(d)}
                      className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 hover:border-blue-400 hover:text-blue-600 text-slate-600 rounded-lg transition-colors">
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {DIVS.map(d => {
                  const ds  = filtered.filter(s => s.div === d);
                  const avg = ds.length ? Math.round(ds.reduce((a, s) => a + s.codScore, 0) / ds.length) : 0;
                  const pct = Math.round((avg / 100) * 100);
                  return (
                    <div key={d} className="flex items-center gap-3">
                      <span className="text-sm font-black text-slate-700 w-10">Div {d}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-black text-slate-700 w-14 text-right">{avg}/100</span>
                      <span className="text-[10px] text-slate-400 w-12">{ds.length} stu</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Coding Toppers</h3>
            <p className="text-xs text-slate-400 mb-4">Top 5 by coding score</p>
            <div className="space-y-3">
              {codLB.slice(0, 5).map((s, idx) => {
                const medals = ['🥇','🥈','🥉','4️⃣','5️⃣'];
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-lg">{medals[idx]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{s.name}</p>
                      <p className="text-xs font-mono text-slate-400">{s.roll} · {s.dept}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-blue-700">{s.codScore}</p>
                      <p className="text-[10px] text-slate-400">/100</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-blue-50">
              <div>
                <h3 className="font-black text-slate-900">Coding Leaderboard</h3>
                <p className="text-xs text-slate-400 mt-0.5">Top performers by coding score</p>
              </div>
              <Badge color="blue">Top 50 shown</Badge>
            </div>
            <LeaderboardTable students={codLB} scoreKey="codScore" maxScore={100} scoreLabel="Coding Score" />
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          OVERALL LEADERBOARD
      ════════════════════════════════════════ */}
      {activeSection === 'overall' && (
        <div className="space-y-5">

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 mb-1">Top 3 Overall</h3>
            <p className="text-xs text-slate-400 mb-5">Batch Average Total Score: {avgTotal}/150</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {allStudents.slice(0, 3).map((s, idx) => {
                const medals   = ['🥇','🥈','🥉'];
                const podiumBg = ['bg-amber-50 border-amber-200','bg-slate-50 border-slate-200','bg-orange-50 border-orange-200'][idx];
                return (
                  <div key={s.id} className={`rounded-2xl border p-5 text-center ${podiumBg}`}>
                    <div className="text-4xl mb-2">{medals[idx]}</div>
                    <p className="font-black text-slate-900 text-base">{s.name}</p>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{s.roll}</p>
                    <p className="text-xs font-bold text-slate-500 mt-1">{s.dept} · Div {s.div}</p>
                    <div className="mt-4 grid grid-cols-3 gap-1.5 text-center">
                      <div className="bg-white rounded-lg p-2 border border-slate-100">
                        <p className="text-sm font-black text-indigo-700">{s.aptScore}</p>
                        <p className="text-[9px] text-slate-400 font-bold">APT</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-slate-100">
                        <p className="text-sm font-black text-emerald-700">{s.techScore}</p>
                        <p className="text-[9px] text-slate-400 font-bold">TECH</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-slate-100">
                        <p className="text-sm font-black text-blue-700">{s.codScore}</p>
                        <p className="text-[9px] text-slate-400 font-bold">CODE</p>
                      </div>
                    </div>
                    <p className="text-2xl font-black text-slate-900 mt-4">{s.total} <span className="text-xs text-slate-400 font-medium">/150</span></p>
                    <p className="text-xs font-bold text-emerald-600 mt-1">{s.percentile}th percentile</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-amber-50">
              <div>
                <h3 className="font-black text-slate-900">Overall Leaderboard</h3>
                <p className="text-xs text-slate-400 mt-0.5">{filtered.length} students · ranked by total score</p>
              </div>
              <div className="flex gap-2">
                <Badge color="emerald">{qualified.length} qualified</Badge>
                <Badge color="amber">Top 50 shown</Badge>
              </div>
            </div>
            <LeaderboardTable
              students={filtered}
              scoreKey="total"
              maxScore={150}
              scoreLabel="Total"
              showSections
            />
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          QUESTION ANALYSIS
      ════════════════════════════════════════ */}
      {activeSection === 'questions' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3 text-sm text-purple-800 font-medium">
            <TrendingUp size={18} className="text-purple-500 shrink-0" />
            <span>
              Based on <strong>{allStudents.length} submissions</strong>.
              Questions with &lt;45% correct rate are flagged as Hard and should be reviewed for the next drive.
            </span>
          </div>

          <div className="flex gap-2 bg-white border border-slate-200 p-2 rounded-xl shadow-sm overflow-x-auto">
            {['All', 'aptitude', 'technical'].map(s => (
              <button key={s} onClick={() => {}}
                className="px-4 py-2 text-sm font-bold rounded-lg capitalize text-slate-600 hover:bg-slate-50 border border-transparent">
                {s === 'All' ? 'All Questions' : s}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Aptitude Questions</p>
            {QUESTIONS.filter(q => q.section === 'aptitude').map((q, idx) => (
              <QuestionCard key={q.id} q={q} idx={idx} />
            ))}
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mt-2">Technical Questions</p>
            {QUESTIONS.filter(q => q.section === 'technical').map((q, idx) => (
              <QuestionCard key={q.id} q={q} idx={idx} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}