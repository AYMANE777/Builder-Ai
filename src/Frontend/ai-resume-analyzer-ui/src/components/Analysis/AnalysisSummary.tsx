import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, Cpu, Award, RefreshCw, Check, X, User, ShieldCheck } from 'lucide-react';
import { AnalyzeResponse, Suggestion } from '../../lib/api';
import { cn } from '../../lib/utils';

interface Props {
  result: AnalyzeResponse | null;
  onReset: () => void;
}

export const AnalysisSummary: React.FC<Props> = ({ result, onReset }) => {
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<Set<number>>(new Set());
  const [rejectedSuggestions, setRejectedSuggestions] = useState<Set<number>>(new Set());

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500 bg-slate-900/20 backdrop-blur-sm">
        <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
        <p className="text-lg font-medium">No analysis data available</p>
        <p className="text-sm">Upload your resume to see the results here.</p>
      </div>
    );
  }

  const handleAccept = (index: number) => {
    const next = new Set(acceptedSuggestions);
    next.add(index);
    setAcceptedSuggestions(next);
    
    const nextRejected = new Set(rejectedSuggestions);
    nextRejected.delete(index);
    setRejectedSuggestions(nextRejected);
  };

  const handleReject = (index: number) => {
    const next = new Set(rejectedSuggestions);
    next.add(index);
    setRejectedSuggestions(next);

    const nextAccepted = new Set(acceptedSuggestions);
    nextAccepted.delete(index);
    setAcceptedSuggestions(nextAccepted);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

    const levelLabels = ['Reject', 'Junior', 'Mid', 'Senior'];
    const levelValue = typeof result.predictedLevel === 'number' ? levelLabels[result.predictedLevel] : result.predictedLevel;

    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            icon={<TrendingUp className="w-5 h-5 text-indigo-400" />}
            label="Compatibility"
            value={result.compatibilityScore}
            suffix="%"
            color="indigo"
          />
          <StatCard 
            icon={<ShieldCheck className="w-5 h-5 text-violet-400" />}
            label="ATS Score"
            value={result.atsScore}
            suffix="/100"
            color="violet"
          />
          <StatCard 
            icon={<Cpu className="w-5 h-5 text-emerald-400" />}
            label="Skill Match"
            value={result.skillMatchPercentage}
            suffix="%"
            color="emerald"
          />
          <StatCard 
            icon={<Award className="w-5 h-5 text-amber-400" />}
            label="Level"
            value={levelValue}
            isText
            color="amber"
          />
        </div>

        {/* Candidate Profile Info */}
        <motion.div variants={cardVariants} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <User className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-white font-bold">Candidate Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Full Name</p>
              <p className="text-white font-medium">{result.extractedName || "Not detected"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Current Job Title</p>
              <p className="text-white font-medium">{result.extractedJobTitle || "Not detected"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Email Address</p>
              <p className="text-white font-medium">{result.extractedEmail || "Not detected"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Phone Number</p>
              <p className="text-white font-medium">{result.extractedPhone || "Not detected"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase">Location</p>
              <p className="text-white font-medium">{result.extractedCity || "Not detected"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase">LinkedIn</p>
              <p className="text-white font-medium truncate max-w-xs">{result.extractedLinkedIn || "Not detected"}</p>
            </div>
          </div>
        </motion.div>

      {/* Skills Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={cardVariants} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
          <h3 className="flex items-center gap-2 text-white font-bold mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Matched Skills
          </h3>
            <div className="flex flex-wrap gap-2">
              {(result.matchedSkills || []).map((skill, i) => (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={skill}
                  className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div variants={cardVariants} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">
            <h3 className="flex items-center gap-2 text-white font-bold mb-4">
              <XCircle className="w-5 h-5 text-rose-500" />
              Missing Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {(result.missingSkills || []).map((skill, i) => (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={skill}
                  className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full text-sm font-medium"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* AI Suggestions / Edits */}
        <motion.div variants={cardVariants} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-indigo-500" />
              AI Recommended Edits
            </h2>
            <button 
              onClick={onReset}
              className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Start New Analysis
            </button>
          </div>
          
          <div className="space-y-4">
            <AnimatePresence>
              {(result.suggestions || []).map((suggestion, index) => (
              <SuggestionCard
                key={index}
                suggestion={suggestion}
                isAccepted={acceptedSuggestions.has(index)}
                isRejected={rejectedSuggestions.has(index)}
                onAccept={() => handleAccept(index)}
                onReject={() => handleReject(index)}
              />
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

const StatCard: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  value: number | string; 
  suffix?: string;
  isText?: boolean;
  color: 'indigo' | 'emerald' | 'amber' | 'violet';
}> = ({ icon, label, value, suffix = "", isText = false, color }) => {
  const colorClasses = {
    indigo: "from-indigo-500/10 to-transparent border-indigo-500/20",
    emerald: "from-emerald-500/10 to-transparent border-emerald-500/20",
    amber: "from-amber-500/10 to-transparent border-amber-500/20",
    violet: "from-violet-500/10 to-transparent border-violet-500/20"
  };

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
      className={cn("relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border rounded-2xl p-6", colorClasses[color])}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-slate-950 rounded-lg">{icon}</div>
        <span className="text-sm font-medium text-slate-400">{label}</span>
      </div>
      <div className="flex items-end gap-1">
        <span className="text-3xl font-bold text-white">
          {typeof value === 'number' ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {value.toFixed(1)}
            </motion.span>
          ) : value}
        </span>
        <span className="text-lg font-medium text-slate-500 mb-1">{suffix}</span>
      </div>
      {!isText && (
        <div className="mt-4 h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Number(value), 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn("h-full rounded-full", {
              "bg-indigo-500": color === 'indigo',
              "bg-emerald-500": color === 'emerald',
              "bg-amber-500": color === 'amber',
              "bg-violet-500": color === 'violet'
            })}
          />
        </div>
      )}
    </motion.div>
  );
};

const SuggestionCard: React.FC<{
  suggestion: Suggestion;
  isAccepted: boolean;
  isRejected: boolean;
  onAccept: () => void;
  onReject: () => void;
}> = ({ suggestion, isAccepted, isRejected, onAccept, onReject }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "group relative bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 transition-all",
        isAccepted && "border-emerald-500/50 bg-emerald-500/5",
        isRejected && "border-rose-500/50 bg-rose-500/5 opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded text-[10px] font-bold uppercase tracking-wider">
              {suggestion.section}
            </span>
            <span className="text-sm text-slate-400 italic">"{suggestion.reason}"</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Original</span>
              <p className="text-sm text-slate-300 line-through decoration-rose-500/50">{suggestion.originalText}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-500 uppercase">Suggested</span>
              <p className="text-sm text-white font-medium">{suggestion.suggestedText}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onAccept}
            className={cn(
              "p-3 rounded-xl border transition-all",
              isAccepted 
                ? "bg-emerald-500 border-emerald-500 text-white" 
                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-emerald-500 hover:text-emerald-500"
            )}
          >
            <Check className="w-5 h-5" />
          </button>
          <button
            onClick={onReject}
            className={cn(
              "p-3 rounded-xl border transition-all",
              isRejected 
                ? "bg-rose-500 border-rose-500 text-white" 
                : "bg-slate-950 border-slate-800 text-slate-400 hover:border-rose-500 hover:text-rose-500"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {isAccepted && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg"
        >
          <Check className="w-3 h-3" />
        </motion.div>
      )}
    </motion.div>
  );
};
