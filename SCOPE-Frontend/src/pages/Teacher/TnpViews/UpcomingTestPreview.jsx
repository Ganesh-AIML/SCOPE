import { useState } from 'react';
import { 
  ArrowLeft, Edit3, MonitorPlay, Clock, Database, 
  CheckCircle, X, ChevronLeft, ChevronRight, FileText, Code2
} from 'lucide-react';

export default function UpcomingTestPreview({ test, onBack, onEdit }) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // ==========================================
  // 🚀 DATA TRANSFORMER: PostgreSQL -> UI
  // ==========================================
  const activeQuestions = [];

  // 1. Extract MCQs from Aptitude & Technical Sections
  if (test?.sections) {
    test.sections.forEach(sec => {
      sec.questions.forEach(q => {
        activeQuestions.push({
          id: q.id,
          type: 'mcq',
          section: sec.name, // "Aptitude" or "Technical"
          text: q.text,
          options: [
            { id: 'A', text: q.optA },
            { id: 'B', text: q.optB },
            { id: 'C', text: q.optC },
            { id: 'D', text: q.optD }
          ],
          correct: q.ans
        });
      });
    });
  }

  // 2. Extract Coding Problems
  if (test?.codingProblems) {
    test.codingProblems.forEach(cp => {
      activeQuestions.push({
        id: cp.id,
        type: 'coding',
        section: 'Coding',
        text: `${cp.title}\n\n${cp.description}`, // Combine Title & Description
        marks: cp.marks,
        timeLimit: cp.timeLimit,
        memoryLimit: cp.memoryLimit
      });
    });
  }
  // ==========================================

  const currentQ = activeQuestions[currentQIndex];

  const handleStartSimulation = () => {
    setCurrentQIndex(0);
    setSelectedAnswers({});
    setIsSimulating(true);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-8 duration-300 pb-12">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"><ArrowLeft size={20} /></button>
          <button onClick={() => onEdit(test)} className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 px-4 py-2 rounded-lg font-bold transition-colors text-sm shadow-sm"><Edit3 size={16} /> Edit Test</button>
          <div className="ml-2 border-l border-slate-200 pl-4">
            <h2 className="text-xl font-bold text-slate-900">{test.title}</h2>
            <p className="text-sm text-slate-500 font-medium">Scheduled for: {new Date(test.date).toLocaleString()}</p>
          </div>
        </div>
        <button onClick={handleStartSimulation} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm"><MonitorPlay size={18} /> Simulate Student View</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Database size={20}/></div>
          <div><p className="text-xs font-bold text-slate-500 uppercase">Total Questions</p><p className="text-xl font-black text-slate-900">{activeQuestions.length}</p></div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><Clock size={20}/></div>
          <div><p className="text-xs font-bold text-slate-500 uppercase">Duration</p><p className="text-xl font-black text-slate-900">{test.duration} Minutes</p></div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm">Full Question Manifest</h3>
          <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full border border-slate-300">Read-Only Preview</span>
        </div>
        
        <div className="divide-y divide-slate-100">
          {activeQuestions.map((q, i) => (
            <div key={q.id || i} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-black bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Question {i + 1}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded ${q.type === 'coding' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-400'}`}>
                  {q.section}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-900 mb-4 whitespace-pre-wrap">{q.text}</p>
              
              {q.type === 'coding' ? (
                <div className="mt-3 p-4 bg-slate-900 rounded-lg border border-slate-700">
                  <p className="text-emerald-400 font-mono text-xs mb-1">💻 Coding Challenge ({q.marks} Marks)</p>
                  <p className="text-slate-400 text-[10px] font-mono">Max CPU Time: {q.timeLimit}s | Max Memory: {q.memoryLimit}MB</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.options?.map(opt => (
                    <div key={opt.id} className={`p-2.5 rounded border text-xs flex items-center gap-2 ${q.correct === opt.id ? 'bg-emerald-50 border-emerald-200 font-bold text-emerald-800' : 'bg-white border-slate-200 text-slate-600'}`}>
                      <span className="font-bold text-slate-400">{opt.id}.</span> {opt.text}
                      {q.correct === opt.id && <CheckCircle size={14} className="ml-auto text-emerald-500"/>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {isSimulating && currentQ && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3"><MonitorPlay size={20} className="text-indigo-400" /><div><h3 className="font-bold text-sm">Student Workspace Simulator</h3><p className="text-[10px] text-slate-400">Total Questions: {activeQuestions.length}</p></div></div>
              <button onClick={() => setIsSimulating(false)} className="text-slate-400 hover:text-white p-2 bg-slate-800 rounded-lg"><X size={20} /></button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-100 p-6 gap-6">
              <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{currentQ.section}</span>
                  <div className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-200"><Clock size={14} /> Time Left: {test.duration}:00</div>
                </div>
                
                <div className="p-8 flex-1 overflow-y-auto">
                  <div className="flex items-start gap-4 mb-8">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 font-black rounded-lg flex items-center justify-center">{currentQIndex + 1}</span>
                    <p className="text-lg font-semibold text-slate-900 mt-1 whitespace-pre-wrap">{currentQ.text}</p>
                  </div>

                  {currentQ.type === 'coding' ? (
                    <div className="mt-6 border border-slate-700 bg-[#1e1e1e] rounded-xl p-4 font-mono text-sm text-slate-300 shadow-inner">
                      <div className="flex gap-4 mb-4 border-b border-slate-700 pb-3">
                        <span className="text-blue-400 border-b-2 border-blue-400 pb-1 font-bold">Solution.java</span>
                        <span className="text-slate-500 hover:text-slate-300 cursor-pointer">main.py</span>
                      </div>
                      <p className="text-emerald-400 mb-2">// Write your optimized solution below.</p>
                      <p className="text-slate-300">class Solution {'{'}</p>
                      <p className="text-slate-300 pl-4">public static void main(String[] args) {'{'}</p>
                      <br/><br/><br/><br/>
                      <p className="text-slate-300 pl-4">{'}'}</p>
                      <p className="text-slate-300">{'}'}</p>
                      <div className="mt-8 pt-4 border-t border-slate-700 flex justify-end">
                         <button className="bg-emerald-600 text-white font-bold py-2 px-6 rounded text-xs hover:bg-emerald-500">Run Code</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pl-12">
                      {currentQ.options?.map((opt) => {
                        const isSelected = selectedAnswers[currentQIndex] === opt.id;
                        return (
                          <div key={opt.id} onClick={() => setSelectedAnswers({...selectedAnswers, [currentQIndex]: opt.id})} className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-colors cursor-pointer ${isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 bg-white'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-indigo-600' : 'border-slate-300'}`}>
                              {isSelected && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                            </div>
                            <span className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>{opt.text}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl flex justify-between">
                  <button onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))} disabled={currentQIndex === 0} className={`px-6 py-2 border border-slate-300 font-bold rounded-lg text-sm flex items-center gap-2 ${currentQIndex === 0 ? 'text-slate-400 bg-slate-100 cursor-not-allowed' : 'text-slate-700 bg-white hover:bg-slate-50'}`}><ChevronLeft size={16}/> Previous</button>
                  <button onClick={() => setCurrentQIndex(prev => Math.min(activeQuestions.length - 1, prev + 1))} disabled={currentQIndex === activeQuestions.length - 1} className={`px-6 py-2 font-bold rounded-lg shadow-sm text-sm flex items-center gap-2 ${currentQIndex === activeQuestions.length - 1 ? 'bg-slate-300 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>Save & Next <ChevronRight size={16}/></button>
                </div>
              </div>

              <div className="w-full md:w-72 bg-white border border-slate-200 rounded-xl shadow-sm p-4 hidden md:flex flex-col">
                <h4 className="font-bold text-slate-800 text-sm mb-4 border-b border-slate-100 pb-2">Question Palette</h4>
                <div className="flex flex-wrap gap-2 content-start flex-1 overflow-y-auto pr-2 pb-4">
                  {activeQuestions.map((q, idx) => {
                    const isAnswered = q.type === 'coding' ? false : !!selectedAnswers[idx];
                    const isActive = currentQIndex === idx;
                    return (
                      <button key={idx} onClick={() => setCurrentQIndex(idx)} className={`w-10 h-10 rounded-lg border-2 font-bold flex items-center justify-center text-sm transition-all ${isActive ? 'border-indigo-600 bg-indigo-50 text-indigo-700 scale-110 shadow-sm' : isAnswered ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300'}`}>
                        {idx + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}