import React from 'react';
import { AnalyzeResponse } from '../../lib/api';

interface Props {
  result: AnalyzeResponse | null;
}

export const AnalysisSummary: React.FC<Props> = ({ result }) => {
  if (!result) {
    return (
      <div className="rounded-xl border border-dashed border-slate-700 p-6 text-sm text-slate-400">
        Upload a resume and job description to see analysis here.
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl bg-slate-800 p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-50">Analysis Summary</h2>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-slate-200">
          Predicted Level: {result.predictedLevel}
        </span>
      </div>

      <div className="space-y-3">
        <ScoreBar label="Compatibility Score" value={result.compatibilityScore} color="bg-indigo-500" />
        <ScoreBar label="Skill Match" value={result.skillMatchPercentage} color="bg-emerald-500" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SkillList title="Matched Skills" items={result.matchedSkills} highlightColor="bg-emerald-600/20" />
        <SkillList title="Missing Skills" items={result.missingSkills} highlightColor="bg-rose-600/20" />
      </div>
    </div>
  );
};

const ScoreBar: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color
}) => (
  <div>
    <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
      <span>{label}</span>
      <span>{value.toFixed(1)}%</span>
    </div>
    <div className="h-2 w-full rounded-full bg-slate-900">
      <div
        className={`h-2 rounded-full ${color}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  </div>
);

const SkillList: React.FC<{ title: string; items: string[]; highlightColor: string }> = ({
  title,
  items,
  highlightColor
}) => (
  <div>
    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {title}
    </h3>
    {items.length === 0 ? (
      <p className="text-xs text-slate-500">None</p>
    ) : (
      <div className="flex flex-wrap gap-1.5">
        {items.map(skill => (
          <span
            key={skill}
            className={`rounded-full px-2 py-1 text-xs text-slate-100 ${highlightColor}`}
          >
            {skill}
          </span>
        ))}
      </div>
    )}
  </div>
);





