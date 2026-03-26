import { useState } from 'react';
import { 
  ArrowLeft, UploadCloud, Calendar, Clock, Code2, 
  BrainCircuit, Database, Save, Send, Plus, Trash2, 
  FileText, Settings, ShieldAlert, Eye, Lock, X
} from 'lucide-react';
import CodingProblemBuilder from './CodingProblemBuilder';

let globalIdCounter = 0;
const generateUniqueId = () => {
  globalIdCounter += 1;
  return `sec-${globalIdCounter}`;
};

export default function ScheduleTest({ onBack, onPublish, onSaveDraft, initialData }) {
  const [activeTab, setActiveTab] = useState('aptitude'); 

  // Pre-fill test metadata if a draft was passed in, otherwise use defaults
  const [testMeta, setTestMeta] = useState({
    title: initialData?.title || "Upcoming Placement Drive - Phase 2",
    date: initialData?.date || "",
    duration: initialData?.duration || "120",
    attemptLimit: "1",
    qsPerPage: "10",
    startPassword: "",
    endPassword: "",
    showScore: false
  });

  const [aptitudeSections, setAptitudeSections] = useState([]);
  const [techSections, setTechSections] = useState([]);
  
  // FIX 1: The state is declared here
  const [codingProblems, setCodingProblems] = useState([]);

  const [manualModal, setManualModal] = useState({ isOpen: false, type: null, sectionId: null });
  const [tempManualQ, setTempManualQ] = useState({ text: "", optA: "", optB: "", optC: "", optD: "", ans: "A" });
  const [previewModal, setPreviewModal] = useState({ isOpen: false, section: null });

  // --- PUBLISH HANDLER ---
  const handlePublishClick = () => {
    let allQuestions = [];
    const extractQs = (sections, typeName) => {
      sections.forEach(sec => {
        const pool = [...sec.fileQs, ...sec.manualQs];
        const limit = sec.selectCount > 0 ? sec.selectCount : pool.length;
        const selected = pool.slice(0, limit);
        selected.forEach((q, idx) => {
          allQuestions.push({
            id: q.id || `${typeName}-${idx}`,
            type: 'mcq',
            section: `${typeName} (${sec.name || 'General'})`,
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
    };

    extractQs(aptitudeSections, "Aptitude");
    extractQs(techSections, "Technical");

    // FIX 2: Add Coding Problems to the published test so they show in Preview!
    codingProblems.forEach((prob, idx) => {
      allQuestions.push({
        id: prob.id || `coding-${idx}`,
        type: 'coding', 
        section: `Coding Challenge (${prob.difficulty})`,
        title: prob.title,
        text: `${prob.title}\n\n${prob.description}`,
        marks: prob.marks,
        timeLimit: prob.timeLimit,
        memoryLimit: prob.memoryLimit,
        options: [] 
      });
    });

    const newTest = {
      // Data needed for the React UI state
      id: Math.floor(Math.random() * 10000), 
      timeRemaining: `${testMeta.duration}:00`, 
      activeStudents: 0,
      totalStudents: "TBD",
      expectedStudents: "TBD",
      questions: allQuestions,

      // Data needed for the Node.js Backend & PostgreSQL!
      title: testMeta.title || "Untitled Assessment",
      date: testMeta.date || new Date().toISOString(),
      duration: testMeta.duration,
      attemptLimit: testMeta.attemptLimit,
      startPassword: testMeta.startPassword,
      endPassword: testMeta.endPassword,
      showScore: testMeta.showScore,
      status: "Upcoming",
      aptitudeSections: aptitudeSections, // <-- Now sending Aptitude Data
      techSections: techSections,         // <-- Now sending Technical Data
      codingProblems: codingProblems      // <-- Now sending Coding Data
    };
    
    if (onPublish) onPublish(newTest);
  };

  // --- SAVE DRAFT HANDLER ---
  const handleSaveDraftClick = () => {
    const draftData = {
      id: initialData?.id || Math.floor(Math.random() * 10000),
      title: testMeta.title || "Untitled Draft",
      date: testMeta.date,
      duration: testMeta.duration,
      lastSaved: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " Today"
    };
    
    if (onSaveDraft) onSaveDraft(draftData);
  };

  const addSection = (type) => {
    const newSection = {
      id: generateUniqueId(),
      name: "", file: null, 
      fileQs: [], manualQs: [], 
      fileQsCount: 0, manualQsCount: 0, 
      totalDetected: 0, selectCount: 0, marksPerQ: 1, hasNegative: false, negativeMarks: 0.25, 
      shuffleQs: true, shuffleOpts: true
    };
    if (type === 'aptitude') setAptitudeSections([...aptitudeSections, newSection]);
    else setTechSections([...techSections, newSection]);
  };

  const removeSection = (type, id) => {
    if (type === 'aptitude') setAptitudeSections(aptitudeSections.filter(s => s.id !== id));
    else setTechSections(techSections.filter(s => s.id !== id));
  };

  const updateSection = (type, id, field, value) => {
    const updater = prev => prev.map(sec => sec.id === id ? { ...sec, [field]: value } : sec);
    if (type === 'aptitude') setAptitudeSections(updater);
    else setTechSections(updater);
  };

  const handleFileUpload = (e, type, id) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const parsedQuestions = [];
      
      const blocks = text.split(/\n\s*\n/);
      blocks.forEach((block, index) => {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length >= 6) {
          const ansLine = lines[lines.length - 1];
          if (ansLine.toUpperCase().startsWith('ANSWER:')) {
            parsedQuestions.push({
              id: `file-${generateUniqueId()}-${index}`,
              text: lines[0],
              optA: lines[1].replace(/^[A-D][.)]\s*/i, ''),
              optB: lines[2].replace(/^[A-D][.)]\s*/i, ''),
              optC: lines[3].replace(/^[A-D][.)]\s*/i, ''),
              optD: lines[4].replace(/^[A-D][.)]\s*/i, ''),
              ans: ansLine.replace(/ANSWER:\s*/i, '').trim(),
              source: 'File Upload'
            });
          }
        }
      });
      
      const updater = prev => prev.map(sec => {
        if (sec.id === id) {
          const newTotal = parsedQuestions.length + sec.manualQsCount;
          return { ...sec, file: file.name, fileQs: parsedQuestions, fileQsCount: parsedQuestions.length, totalDetected: newTotal };
        }
        return sec;
      });

      if (type === 'aptitude') setAptitudeSections(updater);
      else setTechSections(updater);
    };
    
    reader.readAsText(file);
  };

  const removeFile = (type, id) => {
    const updater = prev => prev.map(sec => {
      if (sec.id === id) {
        return { ...sec, file: null, fileQs: [], fileQsCount: 0, totalDetected: sec.manualQsCount, selectCount: 0 };
      }
      return sec;
    });
    if (type === 'aptitude') setAptitudeSections(updater);
    else setTechSections(updater);
  };

  const handleSaveManualQuestion = () => {
    const { type, sectionId } = manualModal;
    const newQuestion = { id: `manual-${generateUniqueId()}`, ...tempManualQ, source: 'Manual Entry' };

    const updater = prev => prev.map(sec => {
      if (sec.id === sectionId) {
        const newManualQs = [...sec.manualQs, newQuestion];
        return { ...sec, manualQs: newManualQs, manualQsCount: newManualQs.length, totalDetected: sec.fileQsCount + newManualQs.length };
      }
      return sec;
    });

    if (type === 'aptitude') setAptitudeSections(updater);
    else setTechSections(updater);

    setTempManualQ({ text: "", optA: "", optB: "", optC: "", optD: "", ans: "A" });
    setManualModal({ isOpen: false, type: null, sectionId: null });
  };

  const renderSectionBuilder = (sections, type) => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="font-bold text-slate-900">{type === 'aptitude' ? 'Aptitude Configuration' : 'Technical Configuration'}</h3>
          <p className="text-sm text-slate-500">Add subsections, upload Aiken (.txt) banks, and set randomization rules.</p>
        </div>
        <button onClick={() => addSection(type)} className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-4 py-2 rounded-lg transition-colors text-sm border border-indigo-200">
          <Plus size={16}/> Add Subsection
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <p className="text-slate-500 font-medium">No subsections added yet. Click "+ Add Subsection" to begin.</p>
        </div>
      ) : (
        sections.map((sec, index) => (
          <div key={sec.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden relative">
            <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3 flex-1">
                <span className="bg-slate-200 text-slate-700 font-black w-8 h-8 rounded-lg flex items-center justify-center text-sm">{index + 1}</span>
                <input type="text" placeholder="Subsection Name (e.g., Logical Reasoning)" value={sec.name} onChange={(e) => updateSection(type, sec.id, 'name', e.target.value)} className="bg-white border border-slate-300 text-slate-900 rounded-lg px-4 py-1.5 focus:outline-none focus:border-indigo-500 font-bold w-full max-w-md text-sm" />
              </div>
              <button onClick={() => removeSection(type, sec.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4 border-r-0 lg:border-r border-slate-100 lg:pr-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Database size={14}/> Question Source</h4>
                  {sec.totalDetected > 0 && (
                    <button onClick={() => setPreviewModal({ isOpen: true, section: sec })} className="text-xs flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded">
                      <Eye size={14}/> Preview Bank
                    </button>
                  )}
                </div>
                
                <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${sec.file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:border-indigo-400'}`}>
                  {sec.file ? (
                    <div>
                      <FileText size={24} className="text-emerald-500 mx-auto mb-2" />
                      <p className="font-bold text-slate-800 text-sm truncate px-2">{sec.file}</p>
                      <p className="text-xs text-emerald-600 font-bold">{sec.fileQsCount} Questions Extracted</p>
                      <button onClick={() => removeFile(type, sec.id)} className="text-xs text-red-500 font-bold mt-2 hover:underline">Remove File</button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={24} className="text-slate-400 mx-auto mb-2" />
                      <p className="font-bold text-slate-700 text-sm mb-1">Upload Aiken Format (.txt)</p>
                      <label className="inline-block cursor-pointer bg-white border border-slate-200 shadow-sm text-slate-700 font-bold py-1.5 px-3 mt-2 rounded-lg hover:bg-slate-50 transition-colors text-xs">
                        Browse Files
                        <input type="file" accept=".txt" className="hidden" onChange={(e) => handleFileUpload(e, type, sec.id)} />
                      </label>
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-sm font-semibold text-slate-700">Manual Questions Added</span>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900">{sec.manualQsCount}</span>
                    <button onClick={() => setManualModal({ isOpen: true, type, sectionId: sec.id })} className="text-xs bg-white border border-slate-200 px-2 py-1 rounded shadow-sm font-bold text-indigo-600 hover:bg-indigo-50">+ Add</button>
                  </div>
                </div>

                <div className="bg-blue-50 text-blue-800 p-3 rounded-xl border border-blue-100 flex justify-between items-center">
                  <span className="text-sm font-bold uppercase tracking-wide">Total Pool Detected</span>
                  <span className="text-xl font-black">{sec.totalDetected}</span>
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Settings size={14}/> Evaluation Rules</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select N Questions</label>
                    <input type="number" min="0" max={sec.totalDetected} value={sec.selectCount} onChange={(e) => updateSection(type, sec.id, 'selectCount', Math.min(parseInt(e.target.value) || 0, sec.totalDetected))} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500" />
                    <p className="text-[10px] text-slate-400 mt-1">Max available: {sec.totalDetected}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Marks per Question</label>
                    <input type="number" step="0.5" min="0" value={sec.marksPerQ} onChange={(e) => updateSection(type, sec.id, 'marksPerQ', parseFloat(e.target.value) || 0)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={sec.shuffleQs} onChange={(e) => updateSection(type, sec.id, 'shuffleQs', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="text-sm font-semibold text-slate-700">Shuffle Questions</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={sec.shuffleOpts} onChange={(e) => updateSection(type, sec.id, 'shuffleOpts', e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                    <span className="text-sm font-semibold text-slate-700">Shuffle Options</span>
                  </label>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center justify-between cursor-pointer mb-2">
                    <span className="text-sm font-bold text-slate-800 flex items-center gap-2"><ShieldAlert size={16} className="text-red-500"/> Enable Negative Marking</span>
                    <input type="checkbox" checked={sec.hasNegative} onChange={(e) => updateSection(type, sec.id, 'hasNegative', e.target.checked)} className="w-4 h-4 text-red-600 rounded" />
                  </label>
                  {sec.hasNegative && (
                    <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Penalty per wrong answer</span>
                      <input type="number" step="0.25" min="0" value={sec.negativeMarks} onChange={(e) => updateSection(type, sec.id, 'negativeMarks', parseFloat(e.target.value) || 0)} className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-sm text-center font-bold text-red-600 focus:outline-none focus:border-red-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800 text-slate-300 p-3 text-xs font-medium flex justify-between">
              <span>Section Total Marks: <strong className="text-white">{sec.selectCount * sec.marksPerQ}</strong></span>
              <span>Selected {sec.selectCount} out of {sec.totalDetected} pool randomly per student.</span>
            </div>

          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-20 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{initialData ? 'Edit Draft Assessment' : 'Schedule New Assessment'}</h2>
            <p className="text-sm text-slate-500 mt-1">Configure global settings and build test sections.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSaveDraftClick} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg shadow-sm hover:bg-slate-50 flex items-center gap-2">
            <Save size={18}/> Save Draft
          </button>
          <button onClick={handlePublishClick} className="px-6 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all">
            <Send size={18}/> Publish Test
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">Global Exam Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Assessment Title</label>
            <input type="text" value={testMeta.title} onChange={(e) => setTestMeta({...testMeta, title: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-600 font-semibold text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Scheduled Date & Time</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-3 text-slate-400" />
              <input type="datetime-local" value={testMeta.date} onChange={(e) => setTestMeta({...testMeta, date: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-600 font-semibold text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Duration (Minutes)</label>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-3 text-slate-400" />
              <input type="number" value={testMeta.duration} onChange={(e) => setTestMeta({...testMeta, duration: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-blue-600 font-semibold text-sm" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Attempt Limit</label>
            <select value={testMeta.attemptLimit} onChange={(e) => setTestMeta({...testMeta, attemptLimit: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-blue-600">
              <option value="1">1 Attempt</option>
              <option value="2">2 Attempts</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Questions Per Page</label>
            <select value={testMeta.qsPerPage} onChange={(e) => setTestMeta({...testMeta, qsPerPage: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-blue-600">
              <option value="1">1 (One-by-one)</option>
              <option value="10">10 Questions</option>
              <option value="all">All on one page</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Start Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input type="text" placeholder="Optional" value={testMeta.startPassword} onChange={(e) => setTestMeta({...testMeta, startPassword: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg pl-8 pr-3 py-2 text-sm font-semibold focus:outline-none focus:border-blue-600" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">End Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input type="text" placeholder="Optional" value={testMeta.endPassword} onChange={(e) => setTestMeta({...testMeta, endPassword: e.target.value})} className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg pl-8 pr-3 py-2 text-sm font-semibold focus:outline-none focus:border-blue-600" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3">
            <Eye size={18} className="text-blue-600"/>
            <div>
              <p className="text-sm font-bold text-slate-900">Show Results Immediately</p>
              <p className="text-xs text-slate-500">Allow students to see their score and analysis right after submitting.</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={testMeta.showScore} onChange={(e) => setTestMeta({...testMeta, showScore: e.target.checked})} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div className="flex space-x-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
        <button onClick={() => setActiveTab('aptitude')} className={`whitespace-nowrap flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'aptitude' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}><BrainCircuit size={18} /> Aptitude Section</button>
        <button onClick={() => setActiveTab('tech')} className={`whitespace-nowrap flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'tech' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}><Database size={18} /> Technical Section</button>
        <button onClick={() => setActiveTab('coding')} className={`whitespace-nowrap flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'coding' ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}><Code2 size={18} /> Coding Problems</button>
      </div>

      {activeTab === 'aptitude' && renderSectionBuilder(aptitudeSections, 'aptitude')}
      {activeTab === 'tech' && renderSectionBuilder(techSections, 'tech')}
      
      {/* FIX 3: Pass problems & setProblems properly so the child can modify the parent's state! */}
      {activeTab === 'coding' && <CodingProblemBuilder problems={codingProblems} setProblems={setCodingProblems} />}

      {/* MODALS */}
      {manualModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2"><FileText size={18} className="text-indigo-600"/> Add Manual Question</h3>
              <button onClick={() => setManualModal({ isOpen: false, type: null, sectionId: null })} className="text-slate-400 hover:text-slate-700"><X size={20} /></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Question Text</label>
                <textarea rows="3" placeholder="Enter your question here..." value={tempManualQ.text} onChange={e => setTempManualQ({...tempManualQ, text: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500"></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Option A</label>
                  <input type="text" value={tempManualQ.optA} onChange={e => setTempManualQ({...tempManualQ, optA: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Option B</label>
                  <input type="text" value={tempManualQ.optB} onChange={e => setTempManualQ({...tempManualQ, optB: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Option C</label>
                  <input type="text" value={tempManualQ.optC} onChange={e => setTempManualQ({...tempManualQ, optC: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Option D</label>
                  <input type="text" value={tempManualQ.optD} onChange={e => setTempManualQ({...tempManualQ, optD: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Correct Answer</label>
                <select value={tempManualQ.ans} onChange={e => setTempManualQ({...tempManualQ, ans: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-emerald-700 focus:outline-none focus:border-indigo-500">
                  <option value="A">Option A</option><option value="B">Option B</option><option value="C">Option C</option><option value="D">Option D</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setManualModal({ isOpen: false, type: null, sectionId: null })} className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors text-sm">Cancel</button>
              <button onClick={handleSaveManualQuestion} className="px-4 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors text-sm">Save Question</button>
            </div>
          </div>
        </div>
      )}

      {previewModal.isOpen && previewModal.section && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><Database size={18} className="text-indigo-600"/> Question Bank Preview</h3>
                <p className="text-xs text-slate-500 mt-1">Viewing {previewModal.section.totalDetected} questions for {previewModal.section.name || "this subsection"}</p>
              </div>
              <button onClick={() => setPreviewModal({ isOpen: false, section: null })} className="text-slate-400 hover:text-slate-700 p-2 bg-white rounded-lg border border-slate-200"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              <div className="space-y-4">
                {[...previewModal.section.fileQs, ...previewModal.section.manualQs].map((q, i) => (
                  <div key={q.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-black bg-slate-100 text-slate-600 px-2 py-1 rounded">Q{i + 1}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${q.source === 'File Upload' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>{q.source}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900 mb-4 whitespace-pre-wrap">{q.text}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      <div className={`p-2 rounded border text-xs ${q.ans === 'A' ? 'bg-emerald-50 border-emerald-200 font-bold text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>A. {q.optA}</div>
                      <div className={`p-2 rounded border text-xs ${q.ans === 'B' ? 'bg-emerald-50 border-emerald-200 font-bold text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>B. {q.optB}</div>
                      <div className={`p-2 rounded border text-xs ${q.ans === 'C' ? 'bg-emerald-50 border-emerald-200 font-bold text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>C. {q.optC}</div>
                      <div className={`p-2 rounded border text-xs ${q.ans === 'D' ? 'bg-emerald-50 border-emerald-200 font-bold text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>D. {q.optD}</div>
                    </div>
                  </div>
                ))}
                {previewModal.section.totalDetected === 0 && (
                  <div className="text-center py-12 text-slate-500"><Database size={40} className="mx-auto text-slate-300 mb-3" /><p className="font-medium">No questions found.</p><p className="text-sm">Upload a valid Aiken file or add questions manually.</p></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}