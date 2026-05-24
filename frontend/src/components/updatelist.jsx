import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Edit3, Search, Loader2 } from 'lucide-react';
import axiosClient from '../../utils/axiosClient';

function UpdateList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data } = await axiosClient.get('/problem/getAllProblem');
        setProblems(data);
      } catch (err) {
        console.error("Error fetching problems", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const filteredProblems = problems.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-500" /></div>;

  return (
    <div className="p-6 bg-[#0a0c10] min-h-screen text-slate-300">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Select Problem to Update</h2>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search problem by title..." 
            className="w-full bg-[#11141b] border border-slate-800 rounded-xl py-3 pl-10 pr-4 focus:border-indigo-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Problems List */}
        <div className="grid gap-4">
          {filteredProblems.map((prob) => (
            <div 
              key={prob._id}
              onClick={() => navigate(`/admin/update/${prob._id}`)}
              className="bg-[#11141b] border border-slate-800 p-5 rounded-2xl flex justify-between items-center hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-all group"
            >
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{prob.title}</h3>
                <div className="flex gap-3 mt-1">
                  <span className="text-[10px] uppercase bg-slate-800 px-2 py-1 rounded text-slate-400">{prob.difficulty}</span>
                  <span className="text-[10px] uppercase text-slate-500 py-1">{prob.tags}</span>
                </div>
              </div>
              <Edit3 size={20} className="text-slate-600 group-hover:text-indigo-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UpdateList;