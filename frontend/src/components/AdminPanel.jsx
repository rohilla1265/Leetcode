import { useNavigate } from 'react-router';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axiosClient from '../../utils/axiosClient';

// --- Validation Schema (Backend Schema ke sath Match kiya gaya hai) ---
const ProblemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  // Backend Enum: 'array', 'linkedList', 'graph', 'dp', 'String', 'Two Pointers'
  tags: z.enum(['array', 'linkedList', 'graph', 'dp', 'String', 'Two Pointers']),
  
  visibleTestcases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explaination: z.string().min(1, 'Explanation is required') // Match backend spelling
    })
  ).min(1, 'At least one visible test case required'),

  hiddenTestcases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),

  startCode: z.array(
    z.object({
      language: z.string().min(1, 'Language is required'),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3),

  referenceSolution: z.array(
    z.object({
      language: z.string().min(1, 'Language is required'),
      completeCode: z.string().min(1, 'Complete Code is Required')
    })
  ).length(3),
  
  // Isko frontend pe handle karna hoga (User ID)
  problemCreator: z.string().optional() 
});

function AdminPanel() {
  const navigate = useNavigate();
  
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(ProblemSchema),
    defaultValues: {
      visibleTestcases: [{ input: '', output: '', explaination: '' }],
      hiddenTestcases: [{ input: '', output: '' }],
      startCode: [
        { language: 'c++', initialCode: '' },
        { language: 'java', initialCode: '' },
        { language: 'js', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'c++', completeCode: '' },
        { language: 'java', completeCode: '' },
        { language: 'js', completeCode: '' }
      ]
    }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ 
    control, 
    name: 'visibleTestcases' 
  });
  
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ 
    control, 
    name: 'hiddenTestcases' 
  });

  const onSubmit = async (data) => {
    try {
      // Note: Backend pe 'problemCreator' required hai. 
      // Agar auth system hai toh backend khud nikal lega, warna yaha hardcode karni padegi ID.
      const payload = {
        ...data,
        problemCreator: "65f1234567890abcdef12345" // Apni valid User ID yaha daal test ke liye
      };

      await axiosClient.post('problem/create', payload);
      alert('Problem created Successfully!!');
      navigate('/');
    } catch (error) {
      alert(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-300 p-6 lg:p-12 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Create Challenge</h1>
            <p className="text-slate-500 mt-1">Design and publish high-quality coding problems.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost text-slate-400 hover:bg-white/5 flex-1 md:flex-none">Discard</button>
            <button type="submit" form="main-form" className="btn bg-indigo-600 hover:bg-indigo-500 border-none text-white px-8 flex-1 md:flex-none shadow-lg shadow-indigo-600/20">
              Publish Problem
            </button>
          </div>
        </div>

        <form id="main-form" onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          
          {/* Section 1: Core Content */}
          <div className="bg-[#11141b] border border-slate-800 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.2em] mb-8">01. Problem Definition</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
              <div className="md:col-span-4 space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Title</label>
                <input {...register('title')} className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-700" placeholder="e.g. Optimized Array Merging" />
                {errors.title && <p className="text-rose-500 text-[10px] ml-1">{errors.title.message}</p>}
              </div>

              <div className="md:col-span-1 space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Difficulty</label>
                <select {...register('difficulty')} className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 appearance-none">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="md:col-span-1 space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Tag</label>
                <select {...register('tags')} className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 appearance-none uppercase text-[11px]">
                  <option value="array">Array</option>
                  <option value="linkedList">Linked List</option>
                  <option value="graph">Graph</option>
                  <option value="dp">DP</option>
                  <option value="String">String</option>
                  <option value="Two Pointers">Two Pointers</option>
                </select>
              </div>

              <div className="md:col-span-6 space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase ml-1">Problem Description</label>
                <textarea {...register('description')} className="w-full bg-[#0a0c10] border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 h-40 transition-colors font-mono text-sm leading-relaxed" placeholder="Explain the logic..." />
              </div>
            </div>
          </div>

          {/* Section 2: Test Environment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Public Cases */}
            <div className="bg-[#11141b] border border-slate-800 rounded-3xl p-8 flex flex-col h-[600px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em]">02. Public Cases</h2>
                <button type="button" onClick={() => appendVisible({ input: '', output: '', explaination: '' })} className="text-[10px] font-bold py-1.5 px-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-all">
                  + Add Case
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {visibleFields.map((field, index) => (
                  <div key={field.id} className="bg-[#0a0c10] border border-slate-800 p-5 rounded-2xl relative border-l-2 border-l-indigo-500">
                    <button type="button" onClick={() => removeVisible(index)} className="absolute top-3 right-3 text-slate-600 hover:text-rose-400">✕</button>
                    <div className="space-y-3">
                      <input {...register(`visibleTestcases.${index}.input`)} placeholder="Input" className="w-full bg-transparent border-b border-slate-800 py-1 text-sm focus:outline-none focus:border-indigo-500" />
                      <input {...register(`visibleTestcases.${index}.output`)} placeholder="Output" className="w-full bg-transparent border-b border-slate-800 py-1 text-sm focus:outline-none focus:border-indigo-500" />
                      <textarea {...register(`visibleTestcases.${index}.explaination`)} placeholder="Explaination" className="w-full bg-transparent py-1 text-xs text-slate-500 focus:outline-none italic h-16 resize-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Cases */}
            <div className="bg-[#11141b] border border-slate-800 rounded-3xl p-8 flex flex-col h-[600px]">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[11px] font-bold text-emerald-400 uppercase tracking-[0.2em]">03. Hidden Cases</h2>
                <button type="button" onClick={() => appendHidden({ input: '', output: '' })} className="text-[10px] font-bold py-1.5 px-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all">
                  + Add Case
                </button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {hiddenFields.map((field, index) => (
                  <div key={field.id} className="bg-[#0a0c10] border border-slate-800 p-5 rounded-2xl relative border-l-2 border-l-emerald-500">
                    <button type="button" onClick={() => removeHidden(index)} className="absolute top-3 right-3 text-slate-600 hover:text-rose-400">✕</button>
                    <div className="space-y-3">
                      <input {...register(`hiddenTestcases.${index}.input`)} placeholder="Secret Input" className="w-full bg-transparent border-b border-slate-800 py-1 text-sm focus:outline-none focus:border-emerald-500" />
                      <input {...register(`hiddenTestcases.${index}.output`)} placeholder="Secret Output" className="w-full bg-transparent border-b border-slate-800 py-1 text-sm focus:outline-none focus:border-emerald-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Code Implementation */}
          <div className="bg-[#11141b] border border-slate-800 rounded-3xl p-8">
            <h2 className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-8">04. Code Environments</h2>
            <div className="space-y-12">
              {['c++', 'java', 'js'].map((lang, index) => (
                <div key={lang} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-white uppercase">{lang}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-600 uppercase">Initial Template</p>
                      <textarea {...register(`startCode.${index}.initialCode`)} className="w-full bg-[#0a0c10] border border-slate-800 rounded-2xl p-4 font-mono text-xs text-indigo-300 h-64 focus:outline-none focus:border-indigo-500" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-600 uppercase">Reference Solution</p>
                      <textarea {...register(`referenceSolution.${index}.completeCode`)} className="w-full bg-[#0a0c10] border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 h-64 focus:outline-none focus:border-emerald-500" />
                    </div>
                    {/* Hidden language field to ensure it gets sent */}
                    <input type="hidden" {...register(`startCode.${index}.language`)} />
                    <input type="hidden" {...register(`referenceSolution.${index}.language`)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;