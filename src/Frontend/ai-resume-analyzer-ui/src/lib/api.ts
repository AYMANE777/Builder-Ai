export interface AnalyzeResponse {
  compatibilityScore: number;
  skillMatchPercentage: number;
  predictedLevel: string;
  matchedSkills: string[];
  missingSkills: string[];
}

export async function analyzeResume(
  token: string,
  payload: {
    resumeFile: File;
    jobTitle: string;
    jobDescriptionText: string;
    candidateName: string;
    email: string;
    language: string;
  }
): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append('ResumeFile', payload.resumeFile);
  formData.append('JobTitle', payload.jobTitle);
  formData.append('JobDescriptionText', payload.jobDescriptionText);
  formData.append('CandidateName', payload.candidateName);
  formData.append('Email', payload.email);
  formData.append('Language', payload.language);

  const res = await fetch('/api/resume/analyze', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('API Error:', res.status, res.statusText, errorText);
    throw new Error(`Failed to analyze resume: ${res.status} ${res.statusText} - ${errorText}`);
  }

  return res.json();
}


