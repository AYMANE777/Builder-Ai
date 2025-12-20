import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
}

export interface Suggestion {
  category: string;
  context: string;
  suggestionText: string;
  reason: string;
}

export interface AnalyzeResponse {
  compatibilityScore: number;
  skillMatchPercentage: number;
  atsScore: number;
  predictedLevel: number;
  extractedName: string;
  extractedEmail: string;
  extractedPhone: string;
  extractedJobTitle: string;
  extractedCity: string;
  extractedLinkedIn: string;
  extractedWebsite: string;
  workExperiences: WorkExperience[];
  education: Education[];
  resumeText: string;
  jobDescriptionText: string;
  extractedSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: Suggestion[];
}

export const api = {
  analyze: async (formData: FormData): Promise<AnalyzeResponse> => {
    const response = await axios.post(`${API_BASE_URL}/resume/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  reAnalyze: async (data: {
    resumeText: string;
    jobDescriptionText: string;
    candidateName?: string;
    email?: string;
    jobTitle?: string;
    language?: string;
  }): Promise<AnalyzeResponse> => {
    const formData = new FormData();
    formData.append('ResumeText', data.resumeText);
    formData.append('JobDescriptionText', data.jobDescriptionText);
    if (data.candidateName) formData.append('CandidateName', data.candidateName);
    if (data.email) formData.append('Email', data.email);
    if (data.jobTitle) formData.append('JobTitle', data.jobTitle);
    if (data.language) formData.append('Language', data.language || 'en');

    const response = await axios.post(`${API_BASE_URL}/resume/analyze`, formData);
    return response.data;
  }
};
