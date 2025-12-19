import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, User, Mail, Briefcase, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { analyzeResume, AnalyzeResponse } from '../../lib/api';
import { cn } from '../../lib/utils';

interface Props {
  onAnalysisComplete: (result: AnalyzeResponse) => void;
}

export const ResumeUpload: React.FC<Props> = ({ onAnalysisComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const token = 'demo-token';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    try {
      const result = await analyzeResume(token, {
        resumeFile: file,
        jobTitle,
        jobDescriptionText: jobDescription,
        candidateName,
        email,
        language: 'en'
      });
      onAnalysisComplete(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center p-12 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl min-h-[500px]"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles className="w-10 h-10 text-indigo-400" />
              </motion.div>
            </div>
            <h2 className="mt-8 text-2xl font-bold text-white tracking-tight">AI is Analyzing...</h2>
            <p className="mt-2 text-slate-400 text-center max-w-sm">
              Our intelligent engine is cross-referencing your experience with the job requirements.
            </p>
            <div className="mt-8 flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 bg-indigo-500 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl"
          >
            {/* Left Side: Personal & File */}
            <div className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 ml-1">
                  <User className="w-4 h-4 text-indigo-400" /> Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="John Doe"
                  value={candidateName}
                  onChange={e => setCandidateName(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 ml-1">
                  <Mail className="w-4 h-4 text-indigo-400" /> Email Address
                </label>
                <input
                  required
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 ml-1">
                  <FileText className="w-4 h-4 text-indigo-400" /> Resume File
                </label>
                <div className={cn(
                  "relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 transition-all",
                  file ? "border-indigo-500/50 bg-indigo-500/5" : "border-slate-800 hover:border-slate-700 bg-slate-950/30"
                )}>
                  <input
                    required
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={e => setFile(e.target.files?.[0] ?? null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className={cn(
                      "p-4 rounded-full mb-4 transition-transform group-hover:scale-110",
                      file ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"
                    )}>
                      {file ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                    </div>
                    <p className="text-sm font-medium text-slate-200">
                      {file ? file.name : "Click or drag to upload CV"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">PDF, DOCX or TXT up to 10MB</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Side: Job Info */}
            <div className="space-y-6">
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 ml-1">
                  <Briefcase className="w-4 h-4 text-indigo-400" /> Target Job Title
                </label>
                <input
                  required
                  type="text"
                  placeholder="Senior Software Engineer"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 ml-1">
                  <FileText className="w-4 h-4 text-indigo-400" /> Job Description
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Paste the job requirements here..."
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                />
              </motion.div>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!file}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                <Sparkles className="w-5 h-5" />
                Analyze My Resume
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
