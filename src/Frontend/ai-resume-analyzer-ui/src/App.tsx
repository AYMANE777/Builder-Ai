import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalyzeResponse } from './lib/api';
import { ResumeUpload } from './components/Upload/ResumeUpload';
import { AnalysisSummary } from './components/Analysis/AnalysisSummary';
import { Sparkles, LayoutDashboard, History, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-indigo-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                Orchids AI
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-indigo-400/80">
                Resume Intelligence
              </span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="text-white flex items-center gap-2 transition-colors"><LayoutDashboard className="w-4 h-4" /> Dashboard</a>
            <a href="#" className="hover:text-white flex items-center gap-2 transition-colors"><History className="w-4 h-4" /> History</a>
            <a href="#" className="hover:text-white flex items-center gap-2 transition-colors"><Settings className="w-4 h-4" /> Settings</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="px-5 py-2 rounded-full bg-slate-900 border border-slate-800 text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95">
              Sign In
            </button>
            <button className="px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all active:scale-95">
              Get Started
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-6 py-12">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4 max-w-2xl mx-auto">
                <motion.h1 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-5xl md:text-6xl font-black tracking-tight"
                >
                  Optimize for your <span className="text-indigo-500">Dream Job</span>
                </motion.h1>
                <p className="text-lg text-slate-400 font-medium">
                  Upload your resume and paste the job description. Our AI will help you bridge the gap and land the interview.
                </p>
              </div>
              <ResumeUpload onAnalysisComplete={setResult} />
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <AnalysisSummary 
                result={result} 
                onReset={() => setResult(null)} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950/50 py-12">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <div className="h-5 w-5 rounded bg-slate-700" />
            <span className="text-sm font-bold">Orchids AI</span>
          </div>
          <p className="text-slate-500 text-sm italic">
            "Your resume is your story. Let AI help you tell it better."
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;





