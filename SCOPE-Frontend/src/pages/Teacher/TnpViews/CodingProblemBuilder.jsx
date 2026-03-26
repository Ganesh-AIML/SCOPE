import { 
  Code2, Plus, Trash2, Settings, TerminalSquare, 
  Lock, Unlock, Cpu, MemoryStick, CheckCircle, X,
  UploadCloud, CheckSquare, Square
} from 'lucide-react';

let problemIdCounter = 0;
const generateProblemId = () => { problemIdCounter++; return `prob-${problemIdCounter}`; };

let testCaseIdCounter = 0;
const generateTestCaseId = () => { testCaseIdCounter++; return `tc-${testCaseIdCounter}`; };

// THE FIX: We are accepting the state from the parent ScheduleTest.jsx!
export default function CodingProblemBuilder({ problems, setProblems }) {

  const SUPPORTED_LANGUAGES = [
    { id: 50, name: "C (GCC 9.2)" },
    { id: 54, name: "C++ (GCC 9.2)" },
    { id: 51, name: "C# (Mono 6.6)" },
    { id: 60, name: "Go (1.13)" },
    { id: 62, name: "Java (OpenJDK 13)" },
    { id: 93, name: "JavaScript (Node)" },
    { id: 78, name: "Kotlin (1.3)" },
    { id: 68, name: "PHP (7.4)" },
    { id: 71, name: "Python 3" },
    { id: 72, name: "Ruby (2.7)" },
    { id: 73, name: "Rust (1.40)" },
    { id: 74, name: "TypeScript (3.7)" }
  ];

  const addProblem = () => {
    setProblems([...problems, {
      id: generateProblemId(),
      title: "",
      description: "",
      difficulty: "Medium",
      marks: 50,
      timeLimit: 2.0, 
      memoryLimit: 128000, 
      allowedLanguages: SUPPORTED_LANGUAGES.map(l => l.id), 
      testCases: [
        { id: generateTestCaseId(), input: "", output: "", isHidden: false }
      ]
    }]);
  };

  const removeProblem = (id) => setProblems(problems.filter(p => p.id !== id));

  const updateProblem = (id, field, value) => {
    setProblems(problems.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const toggleLanguage = (probId, langId) => {
    setProblems(problems.map(p => {
      if (p.id === probId) {
        const hasLang = p.allowedLanguages.includes(langId);
        const newLangs = hasLang 
          ? p.allowedLanguages.filter(id => id !== langId)
          : [...p.allowedLanguages, langId];
        return { ...p, allowedLanguages: newLangs };
      }
      return p;
    }));
  };

  const setAllLanguages = (probId, selectAll) => {
    setProblems(problems.map(p => p.id === probId ? { ...p, allowedLanguages: selectAll ? SUPPORTED_LANGUAGES.map(l => l.id) : [] } : p));
  };

  const addTestCase = (probId) => {
    setProblems(problems.map(p => {
      if (p.id === probId) {
        return { ...p, testCases: [...p.testCases, { id: generateTestCaseId(), input: "", output: "", isHidden: true }] };
      }
      return p;
    }));
  };

  const removeTestCase = (probId, tcId) => {
    setProblems(problems.map(p => {
      if (p.id === probId) {
        return { ...p, testCases: p.testCases.filter(tc => tc.id !== tcId) };
      }
      return p;
    }));
  };

  const updateTestCase = (probId, tcId, field, value) => {
    setProblems(problems.map(p => {
      if (p.id === probId) {
        const updatedTCs = p.testCases.map(tc => tc.id === tcId ? { ...tc, [field]: value } : tc);
        return { ...p, testCases: updatedTCs };
      }
      return p;
    }));
  };

  const setAllTestCasesVisibility = (probId, isHidden) => {
    setProblems(problems.map(p => {
      if (p.id === probId) {
        return { ...p, testCases: p.testCases.map(tc => ({ ...tc, isHidden })) };
      }
      return p;
    }));
  };

  const handleBulkTestCaseUpload = (e, probId) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const blocks = text.split(/===+/);
      const newTestCases = [];

      blocks.forEach(block => {
        if (block.trim()) {
          const outSplit = block.split(/OUTPUT:/i);
          if (outSplit.length === 2) {
            const input = outSplit[0].replace(/INPUT:/i, '').trim();
            const output = outSplit[1].trim();
            if (input || output) {
              newTestCases.push({
                id: generateTestCaseId(),
                input: input,
                output: output,
                isHidden: true 
              });
            }
          }
        }
      });

      if (newTestCases.length > 0) {
        setProblems(problems.map(p => {
          if (p.id === probId) {
            return { ...p, testCases: [...p.testCases, ...newTestCases] };
          }
          return p;
        }));
        alert(`Successfully imported ${newTestCases.length} test cases!`);
      } else {
        alert("Format error. Please ensure the .txt file uses INPUT: and OUTPUT: separated by ===");
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Code2 size={24}/></div>
          <div>
            <h3 className="font-bold text-blue-900">Judge0 Coding Configuration</h3>
            <p className="text-sm text-blue-700">Add programming challenges with strict memory/time limits and Base64-ready test cases.</p>
          </div>
        </div>
        <button 
          onClick={addProblem}
          className="flex items-center gap-2 bg-white hover:bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-lg transition-colors text-sm border border-blue-200 shadow-sm"
        >
          <Plus size={16}/> Add Problem
        </button>
      </div>

      {(!problems || problems.length === 0) ? (
        <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
          <TerminalSquare size={48} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No coding problems added yet.</p>
          <p className="text-sm text-slate-400 mt-1">Click the button above to create your first Judge0 challenge.</p>
        </div>
      ) : (
        problems.map((prob, index) => (
          <div key={prob.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="bg-blue-600 text-white font-black w-8 h-8 rounded-lg flex items-center justify-center text-sm">Q{index + 1}</span>
                <input 
                  type="text" placeholder="Problem Title (e.g., Two Sum)" 
                  value={prob.title} onChange={(e) => updateProblem(prob.id, 'title', e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 font-bold w-64 text-sm"
                />
              </div>
              <button onClick={() => removeProblem(prob.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={18}/></button>
            </div>

            <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-8">
              
              <div className="xl:col-span-1 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Problem Description (Markdown)</label>
                  <textarea 
                    rows="6" placeholder="Explain the problem, input format, and constraints..."
                    value={prob.description} onChange={(e) => updateProblem(prob.id, 'description', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 font-mono resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Difficulty</label>
                    <select value={prob.difficulty} onChange={(e) => updateProblem(prob.id, 'difficulty', e.target.value)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500">
                      <option>Easy</option><option>Medium</option><option>Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Marks</label>
                    <input type="number" min="1" value={prob.marks} onChange={(e) => updateProblem(prob.id, 'marks', parseInt(e.target.value)||0)} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-2"><Settings size={14}/> Judge0 Execution Limits</h4>
                  
                  <div>
                    <label className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
                      <span className="flex items-center gap-1"><Cpu size={12}/> CPU Time Limit</span>
                      <span className="text-blue-600 font-black">{prob.timeLimit.toFixed(1)}s</span>
                    </label>
                    <input 
                      type="range" min="0.5" max="15.0" step="0.5" value={prob.timeLimit} 
                      onChange={(e) => updateProblem(prob.id, 'timeLimit', parseFloat(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                    <div className="flex justify-between text-[8px] text-slate-400 font-bold mt-1">
                      <span>0.5s</span><span>15.0s</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 flex items-center gap-1"><MemoryStick size={12}/> Memory Limit</label>
                    <select value={prob.memoryLimit} onChange={(e) => updateProblem(prob.id, 'memoryLimit', parseInt(e.target.value))} className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-500">
                      <option value={64000}>64 MB</option>
                      <option value={128000}>128 MB (Default)</option>
                      <option value={256000}>256 MB</option>
                      <option value={512000}>512 MB</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Allowed Languages</h4>
                    <div className="flex gap-2">
                      <button onClick={() => setAllLanguages(prob.id, true)} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"><CheckSquare size={10}/> All</button>
                      <button onClick={() => setAllLanguages(prob.id, false)} className="text-[10px] font-bold text-slate-400 hover:underline flex items-center gap-1"><Square size={10}/> None</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORTED_LANGUAGES.map(lang => {
                      const isSelected = prob.allowedLanguages.includes(lang.id);
                      return (
                        <button 
                          key={lang.id} onClick={() => toggleLanguage(prob.id, lang.id)}
                          className={`px-3 py-1 text-xs font-bold rounded-full border transition-colors ${isSelected ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`}
                        >
                          {lang.name} {isSelected && <CheckCircle size={10} className="inline ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="xl:col-span-2 bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col">
                
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 pb-4 border-b border-slate-200">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2"><TerminalSquare size={18} className="text-indigo-600"/> Test Case Studio</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{prob.testCases.length} Active Cases</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex bg-white rounded-lg border border-slate-200 overflow-hidden mr-2">
                      <button onClick={() => setAllTestCasesVisibility(prob.id, true)} className="px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-50 border-r border-slate-200 flex items-center gap-1"><Lock size={12}/> Hide All</button>
                      <button onClick={() => setAllTestCasesVisibility(prob.id, false)} className="px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-1"><Unlock size={12}/> Public All</button>
                    </div>

                    <label className="cursor-pointer flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition-colors text-xs border border-slate-200 shadow-sm">
                      <UploadCloud size={14}/> Bulk Upload (.txt)
                      <input type="file" accept=".txt" className="hidden" onChange={(e) => handleBulkTestCaseUpload(e, prob.id)} />
                    </label>

                    <button onClick={() => addTestCase(prob.id)} className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors shadow-sm">
                      + Add Single
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[500px]">
                  {prob.testCases.map((tc, tcIndex) => (
                    <div key={tc.id} className={`bg-white border rounded-xl p-4 shadow-sm relative ${tc.isHidden ? 'border-amber-200' : 'border-emerald-200'}`}>
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black bg-slate-100 text-slate-600 px-2 py-1 rounded">Case {tcIndex + 1}</span>
                          <button 
                            onClick={() => updateTestCase(prob.id, tc.id, 'isHidden', !tc.isHidden)}
                            className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border transition-colors ${tc.isHidden ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                          >
                            {tc.isHidden ? <><Lock size={10}/> Hidden Validation</> : <><Unlock size={10}/> Public Example</>}
                          </button>
                        </div>
                        <button onClick={() => removeTestCase(prob.id, tc.id)} className="text-slate-400 hover:text-red-500"><X size={16}/></button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Standard Input (stdin)</label>
                          <textarea 
                            rows="2" placeholder="e.g., 5 10" value={tc.input} onChange={(e) => updateTestCase(prob.id, tc.id, 'input', e.target.value)}
                            className="w-full bg-slate-900 text-emerald-400 border border-slate-700 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-indigo-500 resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Expected Output</label>
                          <textarea 
                            rows="2" placeholder="e.g., 15" value={tc.output} onChange={(e) => updateTestCase(prob.id, tc.id, 'output', e.target.value)}
                            className="w-full bg-slate-900 text-amber-400 border border-slate-700 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-indigo-500 resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {prob.testCases.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm font-medium">
                      No test cases configured. Add one manually or upload a bulk file.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        ))
      )}
    </div>
  );
}