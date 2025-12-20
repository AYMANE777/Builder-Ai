import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalyzeResponse, api } from './lib/api';
import { ResumeUpload } from './components/Upload/ResumeUpload';
import { ResumeReview } from './components/Upload/ResumeReview';
import { AnalysisDashboard } from './components/Analysis/AnalysisDashboard';
import { TemplateSelector } from './components/Upload/TemplateSelector';
import { Sparkles, LayoutDashboard, History, Settings, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [step, setStep] = useState<'UPLOAD' | 'TEMPLATE' | 'NAME' | 'REVIEW' | 'DASHBOARD'>('UPLOAD');
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [reviewData, setReviewData] = useState<AnalyzeResponse | null>(null);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  const [resumeName, setResumeName] = useState<string>('');

  const handleAnalysisComplete = (data: AnalyzeResponse) => {
    setReviewData(data);
    setStep('TEMPLATE');
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setStep('NAME');
  };

  const handleNameSubmit = (name: string) => {
    setResumeName(name);
    setStep('REVIEW');
  };

  const handleReviewAccept = async (updatedData: AnalyzeResponse) => {
    setIsReanalyzing(true);
    try {
      const finalResult = await api.reAnalyze({
        resumeText: updatedData.resumeText,
        jobTitle: updatedData.extractedJobTitle || 'Candidate',
        jobDescriptionText: updatedData.jobDescriptionText,
        candidateName: updatedData.extractedName,
        email: updatedData.extractedEmail,
        language: 'en'
      });
      setResult(finalResult);
      setStep('DASHBOARD');
    } catch (error) {
      console.error('Re-analysis failed:', error);
      setResult(updatedData);
      setStep('DASHBOARD');
    } finally {
      setIsReanalyzing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setReviewData(null);
    setStep('UPLOAD');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500/30">
      {isReanalyzing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">Refining Analysis</h3>
              <p className="text-slate-400">Processing your updates...</p>
            </div>
          </div>
        </div>
      )}

      {step === 'TEMPLATE' && (
        <TemplateSelector 
          onSelect={handleTemplateSelect} 
          onCancel={() => setStep('UPLOAD')} 
        />
      )}

      {step === 'NAME' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl text-slate-900"
          >
            <h2 className="text-2xl font-bold mb-4">Name your resume</h2>
            <p className="text-slate-500 mb-6 text-sm">Give your resume a name to easily find it later.</p>
            <input
              autoFocus
              type="text"
              placeholder="e.g. Software Engineer Resume"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-6"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSubmit((e.target as HTMLInputElement).value);
              }}
              onChange={(e) => setResumeName(e.target.value)}
              value={resumeName}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setStep('TEMPLATE')} className="px-5 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all">Back</button>
              <button onClick={() => handleNameSubmit(resumeName)} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition-all">Next</button>
            </div>
          </motion.div>
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={handleReset}>
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
          {step === 'UPLOAD' ? (
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
              <ResumeUpload onAnalysisComplete={handleAnalysisComplete} />
            </motion.div>
          ) : step === 'REVIEW' && reviewData ? (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <ResumeReview 
                data={reviewData} 
                onAccept={handleReviewAccept} 
                onCancel={handleReset} 
              />
            </motion.div>
          ) : step === 'DASHBOARD' && result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <AnalysisSummary 
                result={result!} 
                onReset={handleReset} 
              />
            </motion.div>
          ) : null}
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





