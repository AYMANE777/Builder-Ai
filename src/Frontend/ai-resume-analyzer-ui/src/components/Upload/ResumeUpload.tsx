import React, { useState } from 'react';
import { analyzeResume, AnalyzeResponse } from '../../lib/api';

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

  const token = 'demo-token'; // replace with real JWT token

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
      alert('Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl bg-slate-800 p-6 shadow-xl"
    >
      <div>
        <label className="text-sm font-medium text-slate-200">
          Resume (PDF/DOCX/TXT)
        </label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          className="mt-1 block w-full text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-500"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-200">
            Candidate Name
          </label>
          <input
            type="text"
            value={candidateName}
            onChange={e => setCandidateName(e.target.value)}
            className="mt-1 w-full rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-200">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-200">Job Title</label>
        <input
          type="text"
          value={jobTitle}
          onChange={e => setJobTitle(e.target.value)}
          className="mt-1 w-full rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-200">
          Job Description
        </label>
        <textarea
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-md bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-1 ring-slate-700 focus:ring-indigo-500"
        />
      </div>
      <button
        type="submit"
        disabled={loading || !file}
        className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-600"
      >
        {loading ? 'Analyzing…' : 'Analyze Resume'}
      </button>
    </form>
  );
};





