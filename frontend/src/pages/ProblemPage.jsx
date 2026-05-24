import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
// import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import { NavLink } from 'react-router';
import axiosClient from "../../utils/axiosClient";
import ChatAi from '../components/chatai';
import { useSelector } from 'react-redux';
const ProblemPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightTab, setActiveRightTab] = useState('code');
  const [submissions, setSubmissions] = useState([]);
  const editorRef = useRef(null);
  let { problemId } = useParams();
  const [selectedSubmission, setSelectedSubmission] = useState(null); // Clicked submission save karne ke liye
const [copied, setCopied] = useState(false);

const handleCopyCode = (codeText) => {
  navigator.clipboard.writeText(codeText);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000); // 2 second baad 'Copied' text hat jayega
};
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/${problemId}`);
        setProblem(response.data);
        const initial = response.data.startCode.find((sc) => {
          const apiLang = sc.language.toLowerCase();
          const currentLang = selectedLanguage.toLowerCase();
          return apiLang === currentLang || (apiLang === 'c++' && currentLang === 'cpp');
        })?.initialCode || '';
        setCode(initial);
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [problemId]);
  // Jab bhi user 'submissions' tab par click kare, tab data fetch ho:
useEffect(() => {
    const fetchSubmissions = async () => {
        try {
            // problem?._id aapke parent component se aane wali ID honi chahiye
            const response = await axiosClient.get(`/problem/solutions/${problem?._id}`); 
            if (response.data.success) {
                setSubmissions(response.data.submissions);
            }
        } catch (err) {
            console.error("Error fetching submissions:", err);
        }
    };

    if (activeLeftTab === 'submissions' && problem?._id) {
        fetchSubmissions();
    }
}, [activeLeftTab, problem?._id]);

  useEffect(() => {
    if (problem) {
      const initialCode = problem.startCode.find(sc => {
        const apiLang = sc.language.toLowerCase();
        const currentLang = selectedLanguage.toLowerCase();
        return apiLang === currentLang || (apiLang === 'c++' && currentLang === 'cpp');
      })?.initialCode || '';
      setCode(initialCode);
    }
  }, [selectedLanguage, problem]);

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, { code, language: selectedLanguage });
      setRunResult(response.data);
      setActiveRightTab('testcase');
    } catch (error) {
      setRunResult({ status: 'error', errorMessage: 'Internal server error' });
      setActiveRightTab('testcase');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, { code, language: selectedLanguage });
      setSubmitResult(response.data);
      setActiveRightTab('result');
    } catch (error) {
      console.error('Error submitting code:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex h-screen w-screen justify-center items-center bg-base-200 text-indigo-500">
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );
  }

  return (

    <div className="h-screen flex flex-col bg-base-200 overflow-hidden p-2 gap-2">
      <nav className="border-b border-slate-800 bg-[#11141b]/50 backdrop-blur-md shrink-0">
        <div className="max-w-full mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <NavLink to="/" className="text-xl font-bold text-white tracking-tighter">
              CODE<span className="text-indigo-500">LAB</span>
            </NavLink>
            <NavLink to="/" className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700">
              Problems
            </NavLink>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-slate-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {user?.firstname || 'Guest'}
            </span>
          </div>
        </div>
      </nav>
      <div className="flex-1 flex gap-2 overflow-hidden">

        {/* Left Panel: Description */}
        <div className="w-1/2 flex flex-col bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden">
          <div className="flex bg-base-100 border-b border-base-300 p-1 gap-1">
            {['description', 'editorial', 'solutions', 'submissions', 'ChatAI'].map(tab => (
              <button
                key={tab}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${activeLeftTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-base-200'}`}
                onClick={() => setActiveLeftTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            {problem && activeLeftTab === 'description' && (
              <div className="animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-extrabold text-base-content">{problem.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
                <div className="flex gap-2 mb-6">
                  {problem.tags?.split(',').map(tag => (
                    <span key={tag} className="badge badge-ghost badge-sm py-3 px-3">{tag}</span>
                  ))}
                </div>
                <div className="prose max-w-none text-base-content/80 text-sm leading-relaxed mb-10">
                  {problem.description}
                </div>
                <div className="space-y-6">
                  <h3 className="text-lg font-bold border-l-4 border-indigo-500 pl-3 text-base-content">Examples</h3>
                  {problem.visibleTestcases?.map((example, index) => (
                    <div key={index} className="bg-base-200/50 border border-base-300 p-4 rounded-xl">
                      <div className="grid gap-2 text-sm font-mono">
                        <p><span className="text-indigo-500 font-bold">Input:</span> {example.input}</p>
                        <p><span className="text-indigo-500 font-bold">Output:</span> {example.output}</p>
                        {example.explaination && <p className="text-base-content/60 italic mt-1">Explanation: {example.explaination}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeLeftTab === 'editorial' && (
              <div className="prose max-w-none">
                <h2 className="text-xl font-bold mb-4">Editorial</h2>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {'Editorial is here for the problem'}
                </div>
              </div>
            )}
           {activeLeftTab === 'submissions' && (
  <div className="p-4 bg-base-100 rounded-xl relative">
    <h3 className="text-lg font-bold mb-4">Past Submissions ({submissions?.length || 0})</h3>
    
    {!submissions || submissions.length === 0 ? (
      <p className="text-sm text-base-content/60">No submissions found for this problem.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="table w-full border-collapse">
          <thead>
            <tr className="border-b border-base-300">
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Language</th>
              <th className="text-left p-2">Runtime</th>
              <th className="text-left p-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((sub) => (
              <tr 
                key={sub._id} 
                className="border-b border-base-200 hover:bg-base-200/70 cursor-pointer transition-colors"
                onClick={() => setSelectedSubmission(sub)} // Click karne par modal khulega
              >
                <td className="p-2 font-semibold">
                  <span className={
                    sub.status === 'accepted' ? 'text-green-500' : 
                    sub.status === 'wrong' ? 'text-red-500' : 'text-warning'
                  }>
                    {sub.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-2"><span className="badge badge-sm badge-ghost">{sub.language}</span></td>
                <td className="p-2 text-base-content/70">{sub.runtime} ms</td>
                <td className="p-2 text-xs text-base-content/60">
                  {new Date(sub.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}

    {/* --- CODE VIEWER MODAL (LEETCODE STYLE) --- */}
    {selectedSubmission && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
        <div className="bg-neutral text-neutral-content w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden m-4 border border-base-300">
          
          {/* Modal Header */}
          <div className="flex justify-between items-center p-4 bg-base-300 border-b border-base-200">
            <div className="flex items-center gap-3">
              <span className={`text-md font-bold ${selectedSubmission.status === 'accepted' ? 'text-green-500' : 'text-red-500'}`}>
                {selectedSubmission.status.toUpperCase()}
              </span>
              <span className="badge badge-outline">{selectedSubmission.language}</span>
              <span className="text-xs text-base-content/70">{new Date(selectedSubmission.createdAt).toLocaleString()}</span>
            </div>
            
            {/* Close Button */}
            <button 
              className="btn btn-sm btn-circle btn-ghost"
              onClick={() => setSelectedSubmission(null)}
            >✕</button>
          </div>

          {/* Modal Body (Code View) */}
          <div className="p-4 relative max-h-[60vh] overflow-y-auto bg-stone-950 font-mono text-sm leading-relaxed text-stone-200">
            
            {/* Copy Action Button */}
            <button 
              className="absolute top-4 right-4 btn btn-xs btn-primary gap-1 Normal-case"
              onClick={() => handleCopyCode(selectedSubmission.code)}
            >
              {copied ? (
                <span className="text-green-400 font-sans">✓ Copied!</span>
              ) : (
                <span>Copy Code</span>
              )}
            </button>

            {/* Code Content */}
            <pre className="whitespace-pre-wrap pt-6">{selectedSubmission.code}</pre>
          </div>
          
        </div>
      </div>
    )}
  </div>
)}
            {activeLeftTab === 'ChatAI' && (
              <div className="prose max-w-none">
                <h2 className="text-xl font-bold mb-4">CHAT with AI</h2>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  <ChatAi problem={problem}></ChatAi>
                </div>
              </div>
            )}
            {activeLeftTab === 'solutions' && (
              <div className="space-y-4">
                {problem?.referenceSolution?.map((sol, i) => (
                  <div key={i} className="collapse collapse-arrow bg-base-200 border border-base-300 rounded-xl">
                    <input type="radio" name="solution-accordion" defaultChecked={i === 0} />
                    <div className="collapse-title font-bold text-sm">{sol.language.toUpperCase()} Solution</div>
                    <div className="collapse-content overflow-x-auto">
                      <pre className="text-xs p-2 bg-neutral text-neutral-content rounded-lg"><code>{sol.completeCode}</code></pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Editor & Results */}
        <div className="w-1/2 flex flex-col gap-2">

          {/* Editor Container */}
          <div className="flex-1 flex flex-col bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-2 bg-base-100 border-b border-base-300">
              <div className="flex gap-1">
                {['javascript', 'java', 'cpp'].map((lang) => (
                  <button
                    key={lang}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedLanguage === lang ? 'bg-indigo-600 text-white' : 'hover:bg-base-200'}`}
                    onClick={() => setSelectedLanguage(lang)}
                  >
                    {lang === 'cpp' ? 'C++' : lang.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="btn btn-ghost btn-xs">Reset</button>
              </div>
            </div>

            <div className="flex-1 relative">
              <Editor
                height="100%"
                language={getLanguageForMonaco(selectedLanguage)}
                value={code}
                theme="vs-dark"
                onChange={(val) => setCode(val || '')}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  padding: { top: 10 },
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  cursorSmoothCaretAnimation: "on"
                }}
              />
            </div>

            <div className="p-3 border-t border-base-300 flex justify-between items-center bg-base-100">
              <button className={`btn btn-sm btn-ghost gap-2 ${activeRightTab === 'testcase' ? 'text-indigo-500' : ''}`} onClick={() => setActiveRightTab('testcase')}>
                Console {runResult && <span className="badge badge-xs bg-indigo-500"></span>}
              </button>
              <div className="flex gap-2">
                <button className="btn btn-outline btn-sm px-6 border-base-300" onClick={handleRun} disabled={loading}>
                  {loading ? <span className="loading loading-spinner loading-xs"></span> : 'Run'}
                </button>
                <button className="btn bg-indigo-600 hover:bg-indigo-700 text-white border-none btn-sm px-6 shadow-lg shadow-indigo-600/20" onClick={handleSubmitCode} disabled={loading}>
                  Submit
                </button>
              </div>
            </div>
          </div>

          {/* Results Drawer (Conditionally rendered but fixed size or integrated) */}
          <div className="h-1/3 bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden flex flex-col">
            <div className="tabs tabs-boxed bg-transparent p-1 gap-2 border-b border-base-300 rounded-none">
              <button className={`tab tab-sm ${activeRightTab === 'testcase' ? 'tab-active !bg-base-300' : ''}`} onClick={() => setActiveRightTab('testcase')}>Testcase</button>
              <button className={`tab tab-sm ${activeRightTab === 'result' ? 'tab-active !bg-base-300' : ''}`} onClick={() => setActiveRightTab('result')}>Result</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-base-100">
              {activeRightTab === 'testcase' && (
                <div>
                  {!runResult ? (
                    <p className="text-gray-400 text-sm italic">Run code to see test case results...</p>
                  ) : (
                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                      <div className={`p-4 rounded-xl ${runResult.status === 'accepted' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <h4 className={`font-bold flex items-center gap-2 ${runResult.status === 'accepted' ? 'text-green-700' : 'text-red-700'}`}>
                          {runResult.status === 'accepted' ? '✅ All test cases passed!' : `❌ ${runResult.status.toUpperCase()}`}
                        </h4>
                        {runResult.status === 'accepted' && (
                          <div className="mt-2 text-xs flex gap-4 text-green-600 font-medium">
                            <span>Runtime: {runResult.runtime}s</span>
                            <span>Memory: {runResult.memory} KB</span>
                          </div>
                        )}
                        {!runResult.status === 'accepted' && runResult.errorMessage && (
                          <pre className="mt-2 text-xs bg-red-100 p-2 rounded text-red-600 overflow-x-auto">{runResult.errorMessage}</pre>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeRightTab === 'result' && (
                <div className="animate-in slide-in-from-bottom-2 duration-300">
                  {!submitResult ? (
                    <p className="text-gray-400 text-sm italic">No submissions yet.</p>
                  ) : (
                    <div className={`p-4 rounded-xl ${submitResult.status === 'accepted' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <h4 className="font-extrabold text-lg flex items-center gap-2">
                        {submitResult.status === 'accepted' ? <span className="text-green-600">Accepted 🎉</span> : <span className="text-red-600">Rejected ❌</span>}
                      </h4>
                      <div className="mt-2 space-y-1 text-sm font-medium">
                        <p>Passed: <span className="font-bold">{submitResult.testCasesPassed} / {submitResult.testCasesTotal}</span></p>
                        <p className="text-xs opacity-70 text-base-content">Runtime: {submitResult.runtime}s</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;