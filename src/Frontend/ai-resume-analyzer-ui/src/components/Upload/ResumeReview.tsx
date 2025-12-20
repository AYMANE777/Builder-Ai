import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Tag, Check, X, Edit3, FileText, Briefcase } from 'lucide-react';
import { AnalyzeResponse } from '../../lib/api';
import { cn } from '../../lib/utils';

interface Props {
  data: AnalyzeResponse;
  onAccept: (updatedData: AnalyzeResponse) => void;
  onCancel: () => void;
}

export const ResumeReview: React.FC<Props> = ({ data, onAccept, onCancel }) => {
  const [editedData, setEditedData] = useState<AnalyzeResponse>({
    ...data,
    extractedSkills: data.extractedSkills || [],
    matchedSkills: data.matchedSkills || [],
    missingSkills: data.missingSkills || [],
    suggestions: data.suggestions || [],
    resumeText: data.resumeText || '',
    jobDescriptionText: data.jobDescriptionText || ''
  });
  const [newSkill, setNewSkill] = useState('');

  const handleSkillRemove = (skill: string) => {
    setEditedData(prev => ({
      ...prev,
      extractedSkills: prev.extractedSkills.filter(s => s !== skill)
    }));
  };

  const handleSkillAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkill.trim() && !editedData.extractedSkills.includes(newSkill.trim())) {
      setEditedData(prev => ({
        ...prev,
        extractedSkills: [...prev.extractedSkills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-6xl mx-auto p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl space-y-8"
    >
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white">Review & Refine</h2>
          <p className="text-slate-400 mt-1">Perfect your resume content against the job description.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
          <button
            onClick={() => onAccept(editedData)}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            <Check className="w-4 h-4" /> Accept & Analyze
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
              <User className="w-4 h-4" /> Profile Details
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
                <input
                  type="text"
                  value={editedData.extractedName}
                  onChange={e => setEditedData(prev => ({ ...prev, extractedName: e.target.value }))}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">Email Address</label>
                <input
                  type="email"
                  value={editedData.extractedEmail}
                  onChange={e => setEditedData(prev => ({ ...prev, extractedEmail: e.target.value }))}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">Phone Number</label>
                <input
                  type="text"
                  value={editedData.extractedPhone}
                  onChange={e => setEditedData(prev => ({ ...prev, extractedPhone: e.target.value }))}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Skills
            </h3>
            
            <div className="space-y-4">
              <form onSubmit={handleSkillAdd} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add skill..."
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all"
                >
                  Add
                </button>
              </form>

              <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-2">
                {editedData.extractedSkills.map(skill => (
                  <span
                    key={skill}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-300"
                  >
                    {skill}
                    <button
                      onClick={() => handleSkillRemove(skill)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <div className="space-y-4 flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Resume Content
              </h3>
              <textarea
                value={editedData.resumeText}
                onChange={e => setEditedData(prev => ({ ...prev, resumeText: e.target.value }))}
                className="flex-1 min-h-[400px] bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono leading-relaxed resize-none"
                placeholder="Paste or edit your resume text here..."
              />
            </div>

            <div className="space-y-4 flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Job Description
              </h3>
              <textarea
                value={editedData.jobDescriptionText}
                onChange={e => setEditedData(prev => ({ ...prev, jobDescriptionText: e.target.value }))}
                className="flex-1 min-h-[400px] bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono leading-relaxed resize-none"
                placeholder="Paste the job description here..."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 flex gap-4 items-center">
        <div className="p-3 bg-indigo-500/10 rounded-xl">
          <Edit3 className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-white">Live Editing Mode</h4>
          <p className="text-xs text-slate-400">Edit your resume content to match the job description. The final analysis will use this updated text.</p>
        </div>
      </div>
    </motion.div>
  );
};
