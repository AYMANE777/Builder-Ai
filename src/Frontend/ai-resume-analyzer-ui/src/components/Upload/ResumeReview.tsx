import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Tag, Check, X, Edit3, Save } from 'lucide-react';
import { AnalyzeResponse } from '../../lib/api';
import { cn } from '../../lib/utils';

interface Props {
  data: AnalyzeResponse;
  onAccept: (updatedData: AnalyzeResponse) => void;
  onCancel: () => void;
}

export const ResumeReview: React.FC<Props> = ({ data, onAccept, onCancel }) => {
  const [editedData, setEditedData] = useState<AnalyzeResponse>({ ...data });
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
      className="w-full max-w-4xl mx-auto p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl space-y-8"
    >
      <div className="flex justify-between items-center border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white">Review Extracted Data</h2>
          <p className="text-slate-400 mt-1">Check and edit the information AI found in your resume.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
            <User className="w-4 h-4" /> Personal Information
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  value={editedData.extractedName}
                  onChange={e => setEditedData(prev => ({ ...prev, extractedName: e.target.value }))}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="email"
                  value={editedData.extractedEmail}
                  onChange={e => setEditedData(prev => ({ ...prev, extractedEmail: e.target.value }))}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  value={editedData.extractedPhone}
                  onChange={e => setEditedData(prev => ({ ...prev, extractedPhone: e.target.value }))}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
            <Tag className="w-4 h-4" /> Extracted Skills
          </h3>
          
          <div className="space-y-4">
            <form onSubmit={handleSkillAdd} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a skill..."
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

            <div className="flex flex-wrap gap-2 max-h-[250px] overflow-y-auto p-2 border border-slate-800/50 rounded-2xl bg-slate-950/20">
              {editedData.extractedSkills.map(skill => (
                <span
                  key={skill}
                  className="group flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-sm text-indigo-300"
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
              {editedData.extractedSkills.length === 0 && (
                <p className="text-slate-500 text-sm italic p-2">No skills detected. Please add some.</p>
              )}
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
          <p className="text-xs text-slate-400">Your changes will update the analysis score in the next step.</p>
        </div>
      </div>
    </motion.div>
  );
};
