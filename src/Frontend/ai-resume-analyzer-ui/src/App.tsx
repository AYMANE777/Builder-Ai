import React, { useState } from 'react';
import { AnalyzeResponse } from './lib/api';
import { ResumeUpload } from './components/Upload/ResumeUpload';
import { AnalysisSummary } from './components/Analysis/AnalysisSummary';
import { ThemeToggle } from './components/ThemeToggle';

const App: React.FC = () => {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-indigo-500" />
            <span className="text-sm font-semibold tracking-tight">
              AI-Powered Resume Analyzer
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400">Recruiter Dashboard</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <ResumeUpload onAnalysisComplete={setResult} />
          <AnalysisSummary result={result} />
        </div>
      </main>
    </div>
  );
};

export default App;





