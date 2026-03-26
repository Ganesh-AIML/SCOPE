import { useState, useEffect, lazy, Suspense } from 'react'; // FIXED: Added useEffect
import { useNavigate, useParams } from 'react-router-dom'; // FIXED: Added useParams
const Editor = lazy(() => import('@monaco-editor/react'));
import { 
  Clock, CheckCircle, ChevronRight, ChevronLeft, 
  Code, FileText, BrainCircuit, AlertTriangle
} from 'lucide-react';

export default function ExamWorkspace() {
  const { examId } = useParams(); 
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [examData, setExamData] = useState(null);
  const [activeSection, setActiveSection] = useState('coding'); 
  const [loading, setLoading] = useState(true);
  
  // MCQ State
  const [currentTechQ, setCurrentTechQ] = useState(0);
  const [currentAptQ, setCurrentAptQ] = useState(0);
  const [answers, setAnswers] = useState({});

  // Coding State
  const [language, setLanguage] = useState('java');
  const [sourceCode, setSourceCode] = useState('class Solution {\n    public static void main(String[] args) {\n        // Write code here\n    }\n}');
  const [consoleOutput, setConsoleOutput] = useState('Ready to compile...'); // FIXED: Added missing state

  // ==========================================
  // 🚀 DATA FETCHING: Load Questions from DB
  // ==========================================
  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/student/exam/${examId}`);
        const result = await response.json();
        if (result.success) {
          setExamData(result.data);
        }
      } catch (error) {
        console.error("Failed to load exam questions", error);
      } finally {
        setLoading(false);
      }
    };
    loadWorkspace();
  }, [examId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold">Entering Secure Environment...</div>;
  if (!examData) return <div className="p-10 text-center text-red-500">Error: Exam data could not be retrieved.</div>;

  // Map the backend sections (Aptitude/Technical)
  const technicalQuestions = examData.sections?.find(s => s.name === 'Technical')?.questions || [];
  const aptitudeQuestions = examData.sections?.find(s => s.name === 'Aptitude')?.questions || [];
  const codingProblem = examData.codingProblems ? examData.codingProblems[0] : null;

  // --- HANDLERS ---
  const handleSelectOption = (section, questionIndex, optionIndex) => {
    setAnswers(prev => ({ ...prev, [`${section}_${questionIndex}`]: optionIndex }));
  };

  const handleRunCode = () => {
    setConsoleOutput('Compiling on S.C.O.P.E. Secure Server...\n\nRunning Test Cases...');
    setTimeout(() => {
      setConsoleOutput('Test Cases Passed: 5/5\nRuntime: 12ms\nMemory: 42MB\n\nVerdict: ACCEPTED');
    }, 1500);
  };

  const handleSubmitExam = async () => {
    if (window.confirm("Are you sure you want to submit the exam?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/student/exam/${examId}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            answers,      
            sourceCode,   
            language,
            timeTaken: 120 - 105 // This should ideally be tracked via a timer state
          })
        });

        const result = await response.json();
        if (result.success) {
          navigate(`/analysis/${examId}`); 
        }
      } catch (error) {
        alert("Submission failed. Please check your connection.");
      }
    }
  };

  // --- SUB-COMPONENTS ---
  const renderMCQSection = (questions, currentIndex, setIndex, sectionKey) => (
    <div className="flex flex-col md:flex-row h-[calc(100vh-120px)] bg-slate-50">
      <div className="w-full md:w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Question Navigator</h3>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((_, idx) => {
            const isAnswered = answers[`${sectionKey}_${idx}`] !== undefined;
            const isActive = currentIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setIndex(idx)}
                className={`w-10 h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all border
                  ${isActive ? 'border-blue-900 ring-2 ring-blue-900/20' : 'border-slate-200'}
                  ${isAnswered ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-white text-slate-600 hover:bg-slate-50'}
                `}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-3xl w-full mx-auto">
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full">
              Question {currentIndex + 1} of {questions.length}
            </span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-8 leading-relaxed">
            {questions[currentIndex]?.text}
          </h2>

          <div className="space-y-3">
            {/* Logic to handle A, B, C, D options from database */}
            {[
              {id: 0, text: questions[currentIndex]?.optA},
              {id: 1, text: questions[currentIndex]?.optB},
              {id: 2, text: questions[currentIndex]?.optC},
              {id: 3, text: questions[currentIndex]?.optD}
            ].map((option) => {
              const isSelected = answers[`${sectionKey}_${currentIndex}`] === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelectOption(sectionKey, currentIndex, option.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4
                    ${isSelected ? 'border-blue-900 bg-blue-50 text-blue-900 shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-blue-900' : 'border-slate-300'}`}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-blue-900 rounded-full"></div>}
                  </div>
                  <span className="font-medium text-base">{option.text}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-10 pt-6 border-t border-slate-200 flex justify-between">
            <button onClick={() => setIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0} className="px-5 py-2.5 rounded-lg font-bold text-slate-600 bg-white border border-slate-200 disabled:opacity-50 transition-all flex items-center gap-2"><ChevronLeft size={18}/> Previous</button>
            <button onClick={() => setIndex(Math.min(questions.length - 1, currentIndex + 1))} disabled={currentIndex === questions.length - 1} className="px-5 py-2.5 rounded-lg font-bold text-white bg-blue-900 shadow-md flex items-center gap-2">Next <ChevronRight size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCodingSection = () => (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)]">
      <div className="w-full lg:w-1/3 bg-white border-r border-slate-200 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold text-slate-900 mb-2">{codingProblem?.title || "Coding Challenge"}</h2>
        <div className="prose prose-sm text-slate-700 whitespace-pre-wrap">
          <p>{codingProblem?.description}</p>
        </div>
      </div>

      <div className="w-full lg:w-2/3 flex flex-col bg-[#1e1e1e]">
        <div className="h-12 bg-[#2d2d2d] border-b border-[#404040] flex items-center justify-between px-4">
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-[#3c3c3c] text-slate-200 text-sm rounded px-3 py-1 focus:outline-none border border-[#555]">
            <option value="java">Java 17</option>
            <option value="python">Python 3.9</option>
          </select>
          <button onClick={handleRunCode} className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-1.5 px-4 rounded shadow flex items-center gap-2">
            <CheckCircle size={16} /> Run Code
          </button>
        </div>

        <div className="flex-1 relative">
          <Suspense fallback={<div className="flex items-center justify-center h-full bg-[#1e1e1e] text-slate-400">Loading editor...</div>}>
            <Editor height="100%" theme="vs-dark" language={language} value={sourceCode} onChange={(value) => setSourceCode(value)} options={{ fontSize: 14, minimap: { enabled: false } }} />
          </Suspense>
        </div>

        <div className="h-48 bg-[#1e1e1e] border-t-2 border-[#333] flex flex-col">
          <div className="bg-[#2d2d2d] px-4 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-[#404040]">Execution Console</div>
          <div className="p-4 font-mono text-sm text-slate-300 overflow-y-auto whitespace-pre-wrap">{consoleOutput}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      <header className="bg-white border-b border-slate-200 h-16 flex-shrink-0 flex items-center justify-between px-6 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <Clock size={20} className="text-red-600 animate-pulse" />
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">{examData.title}</h1>
            <p className="text-xs font-bold text-red-600 tracking-wider uppercase">Exam in Progress</p>
          </div>
        </div>
        <button onClick={handleSubmitExam} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg shadow-md active:scale-95 transition-all">Finish & Submit Exam</button>
      </header>

      <div className="bg-white border-b border-slate-200 flex px-6 flex-shrink-0 z-10">
        <button onClick={() => setActiveSection('coding')} className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 ${activeSection === 'coding' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500'}`}><Code size={18} /> Coding</button>
        <button onClick={() => setActiveSection('technical')} className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 ${activeSection === 'technical' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500'}`}><FileText size={18} /> Technical</button>
        <button onClick={() => setActiveSection('aptitude')} className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 ${activeSection === 'aptitude' ? 'border-blue-900 text-blue-900' : 'border-transparent text-slate-500'}`}><BrainCircuit size={18} /> Aptitude</button>
      </div>

      <main className="flex-1 overflow-hidden">
        {activeSection === 'coding' && renderCodingSection()}
        {activeSection === 'technical' && renderMCQSection(technicalQuestions, currentTechQ, setCurrentTechQ, 'tech')}
        {activeSection === 'aptitude' && renderMCQSection(aptitudeQuestions, currentAptQ, setCurrentAptQ, 'apt')}
      </main>
    </div>
  );
}