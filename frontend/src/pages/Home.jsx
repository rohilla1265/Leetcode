import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axiosClient from '../../utils/axiosClient';
import { NavLink, useNavigate } from 'react-router'; // useNavigate for logout redirect
import { motion, AnimatePresence } from 'framer-motion';
import { registerUser } from '../../authSlice'; // Assuming your action name

function Home() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [filters, setFilters] = useState({
    difficulty: 'all',
    tags: 'all',
    status: 'all'
  });

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (error) { console.error(error); }
    };

    const fetchSolvedProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/problemSolvedByUser');
        setSolvedProblems(data);
      } catch (error) { console.error(error); }
    };

    fetchProblems();
    if (user) fetchSolvedProblems();
  }, [user]);

  const handleLogout = async () => {
    try {
      await axiosClient.post('/auth/logout');
      dispatch(setUser(null));
      localStorage.removeItem('token');
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const filteredProblems = problems.filter(problem => {
    const difficultyMatch = filters.difficulty === 'all' || 
      problem.difficulty?.toLowerCase() === filters.difficulty.toLowerCase();
    const tagMatch = filters.tags === 'all' || 
      (Array.isArray(problem.tags) ? problem.tags.some(t => t.toLowerCase() === filters.tags.toLowerCase()) : problem.tags?.toLowerCase() === filters.tags.toLowerCase());
    const isSolved = solvedProblems.some(sp => sp._id === problem._id);
    const statusMatch = filters.status === 'all' || (filters.status === 'solved' && isSolved);
    return difficultyMatch && tagMatch && statusMatch;
  });

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="border-b border-slate-800/60 bg-[#0d1117]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-10">
            <NavLink to="/" className="text-2xl font-black tracking-tighter group">
              <span className="text-white">CODE</span>
              <span className="text-indigo-500 italic">PUR</span>
            </NavLink>
            <div className="hidden md:flex gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              <NavLink to="/" className="text-indigo-400 border-b border-indigo-500">Problems</NavLink>
              {user?.role === 'admin' && <NavLink to="/admin" className="hover:text-white transition-all">Admin</NavLink>}
            </div>
          </div>
          
          {/* User Profile Section with Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 hover:bg-slate-800/40 p-1.5 pr-3 rounded-full transition-all border border-transparent hover:border-slate-700"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-indigo-500/20 shadow-lg">
                {user?.firstname?.charAt(0) || 'G'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-none">{user?.firstname || 'Guest'}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-tighter">{user?.role || 'Explorer'}</p>
              </div>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-52 bg-[#11141b] border border-slate-800 rounded-2xl shadow-2xl py-2 z-[60]"
                >
                  <div className="px-4 py-3 border-b border-slate-800/50 mb-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Account</p>
                    <p className="text-sm text-slate-200 truncate">{user?.email || 'Guest User'}</p>
                  </div>
                  <NavLink to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors">
                    <span className="text-lg">👤</span> Profile View
                  </NavLink>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <span className="text-lg">➔</span> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-10 flex flex-col md:flex-row gap-10">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-28 space-y-8">
            <div className="bg-[#11141b] rounded-[2rem] border border-slate-800/50 p-6">
              <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-8">Navigation Filters</h3>
              <div className="space-y-7">
                <FilterGroup label="Status" value={filters.status} onChange={(v) => setFilters({...filters, status: v})}>
                  <option value="all">Everything</option>
                  <option value="solved">Solved Task</option>
                </FilterGroup>
                <FilterGroup label="Difficulty" value={filters.difficulty} onChange={(v) => setFilters({...filters, difficulty: v})}>
                  <option value="all">All Difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </FilterGroup>
                <FilterGroup label="Topic" value={filters.tags} onChange={(v) => setFilters({...filters, tags: v})}>
                  <option value="all">All Topics</option>
                  <option value="array">Arrays</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graphs</option>
                  <option value="dp">Dynamic Programming</option>
                </FilterGroup>
              </div>
            </div>
          </div>
        </aside>

        {/* Problems List */}
        <div className="flex-grow">
          <div className="mb-10">
            <h1 className="text-4xl font-black text-white tracking-tighter mb-2">Problem Set</h1>
            <p className="text-slate-500 font-medium">Solve challenges, earn points, and master coding.</p>
          </div>

          <div className="space-y-3">
            <AnimatePresence mode='popLayout'>
              {filteredProblems.length > 0 ? (
                filteredProblems.map((problem, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    key={problem._id}
                    className="group bg-[#11141b] border border-slate-800/40 hover:border-indigo-500/30 rounded-2xl p-5 flex items-center justify-between hover:bg-[#161a24] transition-all"
                  >
                    <div className="flex items-center gap-5">
                       <div className={`w-1.5 h-6 rounded-full ${solvedProblems.some(sp => sp._id === problem._id) ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                       <div>
                          <NavLink to={`/problem/${problem._id}`} className="text-base font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">
                            {problem.title}
                          </NavLink>
                          <div className="flex gap-4 mt-1">
                            <span className={`text-[10px] font-bold uppercase ${getDifficultyTextColor(problem.difficulty)}`}>{problem.difficulty}</span>
                            <span className="text-[10px] text-slate-600 font-mono">{Array.isArray(problem.tags) ? problem.tags[0] : problem.tags}</span>
                          </div>
                       </div>
                    </div>
                    <NavLink to={`/problem/${problem._id}`} className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-indigo-600 transition-all">
                      <span className="text-white text-sm">→</span>
                    </NavLink>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20 text-slate-600 italic border-2 border-dashed border-slate-800/40 rounded-3xl">No data found.</div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}

const FilterGroup = ({ label, value, onChange, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">{label}</label>
    <select 
      className="bg-[#0a0c10] border border-slate-800/80 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500/50 text-[13px] text-slate-400 cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {children}
    </select>
  </div>
);

const getDifficultyTextColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'easy': return 'text-emerald-400';
    case 'medium': return 'text-amber-400';
    case 'hard': return 'text-rose-400';
    default: return 'text-slate-400';
  }
};

export default Home;