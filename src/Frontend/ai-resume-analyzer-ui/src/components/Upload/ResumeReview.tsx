import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, Tag, Check, X, 
  MapPin, Linkedin, Globe, Briefcase, 
  GraduationCap, Plus, Trash2, ChevronDown, ChevronUp,
  Image as ImageIcon
} from 'lucide-react';
import { AnalyzeResponse, WorkExperience, Education } from '../../lib/api';
import { cn } from '../../lib/utils';

interface Props {
  data: AnalyzeResponse;
  onAccept: (updatedData: AnalyzeResponse) => void;
  onCancel: () => void;
}

export const ResumeReview: React.FC<Props> = ({ data, onAccept, onCancel }) => {
  const [editedData, setEditedData] = useState<AnalyzeResponse>({
    ...data,
    workExperiences: data.workExperiences || [],
    education: data.education || [],
    extractedSkills: data.extractedSkills || [],
  });
  
  const [activeSection, setActiveSection] = useState<string | null>('personal');
  const [newSkill, setNewSkill] = useState('');

  const handleWorkExperienceChange = (id: string, field: keyof WorkExperience, value: string) => {
    setEditedData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: crypto.randomUUID(),
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      responsibilities: ''
    };
    setEditedData(prev => ({
      ...prev,
      workExperiences: [newExp, ...prev.workExperiences]
    }));
  };

  const removeWorkExperience = (id: string) => {
    setEditedData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.filter(exp => exp.id !== id)
    }));
  };

  const handleEducationChange = (id: string, field: keyof Education, value: string) => {
    setEditedData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      school: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: ''
    };
    setEditedData(prev => ({
      ...prev,
      education: [newEdu, ...prev.education]
    }));
  };

  const removeEducation = (id: string) => {
    setEditedData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
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

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const SectionHeader = ({ id, title, icon: Icon, children }: { id: string, title: string, icon: any, children: React.ReactNode }) => (
    <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/50 backdrop-blur-sm transition-all hover:border-indigo-500/30">
      <button 
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl">
            <Icon className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>
        {activeSection === id ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
      </button>
      <AnimatePresence>
        {activeSection === id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-800"
          >
            <div className="p-6 space-y-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">Review Extracted Info</h1>
            <p className="text-slate-400">Verify and refine your details before final analysis.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all">
            Discard
          </button>
          <button 
            onClick={() => onAccept(editedData)}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2"
          >
            <Check className="w-5 h-5" /> Start Full Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <SectionHeader id="personal" title="Personal Information" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    value={editedData.extractedName}
                    onChange={e => setEditedData(prev => ({ ...prev, extractedName: e.target.value }))}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    value={editedData.extractedJobTitle}
                    onChange={e => setEditedData(prev => ({ ...prev, extractedJobTitle: e.target.value }))}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="email"
                    value={editedData.extractedEmail}
                    onChange={e => setEditedData(prev => ({ ...prev, extractedEmail: e.target.value }))}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    value={editedData.extractedPhone}
                    onChange={e => setEditedData(prev => ({ ...prev, extractedPhone: e.target.value }))}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">City / Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    value={editedData.extractedCity}
                    onChange={e => setEditedData(prev => ({ ...prev, extractedCity: e.target.value }))}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">LinkedIn Profile</label>
                <div className="relative">
                  <Linkedin className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    value={editedData.extractedLinkedIn}
                    onChange={e => setEditedData(prev => ({ ...prev, extractedLinkedIn: e.target.value }))}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Website / Portfolio</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    value={editedData.extractedWebsite}
                    onChange={e => setEditedData(prev => ({ ...prev, extractedWebsite: e.target.value }))}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase">Profile Photo</label>
                <div className="flex items-center gap-4 p-4 bg-slate-950/30 border border-dashed border-slate-700 rounded-2xl">
                  <div className="p-3 bg-slate-800 rounded-xl">
                    <ImageIcon className="w-6 h-6 text-slate-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Upload a professional headshot (max 2MB)</p>
                  </div>
                  <button className="px-4 py-2 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-lg hover:bg-indigo-500/20 transition-all border border-indigo-500/20">
                    Upload Photo
                  </button>
                </div>
              </div>
            </div>
          </SectionHeader>

          <SectionHeader id="experience" title="Work Experience" icon={Briefcase}>
            <div className="space-y-6">
              <button 
                onClick={addWorkExperience}
                className="w-full flex items-center justify-center gap-2 p-4 bg-slate-950/30 border border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all group"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">Add Work Experience</span>
              </button>

              <div className="space-y-8">
                {editedData.workExperiences.map((exp, index) => (
                  <div key={exp.id} className="relative p-6 bg-slate-950/30 border border-slate-800 rounded-2xl space-y-6 group">
                    <button 
                      onClick={() => removeWorkExperience(exp.id)}
                      className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={e => handleWorkExperienceChange(exp.id, 'company', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={e => handleWorkExperienceChange(exp.id, 'location', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Role</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={e => handleWorkExperienceChange(exp.id, 'role', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={e => handleWorkExperienceChange(exp.id, 'startDate', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
                          placeholder="Jan 2022"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">End Date</label>
                        <input
                          type="text"
                          value={exp.endDate}
                          onChange={e => handleWorkExperienceChange(exp.id, 'endDate', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
                          placeholder="Present"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Responsibilities</label>
                        <textarea
                          value={exp.responsibilities}
                          onChange={e => handleWorkExperienceChange(exp.id, 'responsibilities', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-sm text-white outline-none focus:border-indigo-500/50 min-h-[100px] resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionHeader>

          <SectionHeader id="education" title="Education" icon={GraduationCap}>
            <div className="space-y-6">
              <button 
                onClick={addEducation}
                className="w-full flex items-center justify-center gap-2 p-4 bg-slate-950/30 border border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all group"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">Add Education</span>
              </button>

              <div className="space-y-6">
                {editedData.education.map((edu) => (
                  <div key={edu.id} className="relative p-6 bg-slate-950/30 border border-slate-800 rounded-2xl space-y-4 group">
                    <button 
                      onClick={() => removeEducation(edu.id)}
                      className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase">School / University</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={e => handleEducationChange(edu.id, 'school', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={e => handleEducationChange(edu.id, 'degree', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-600 uppercase">Field of Study</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={e => handleEducationChange(edu.id, 'fieldOfStudy', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionHeader>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Skills Matching
            </h3>
            
            <div className="space-y-4">
              <form onSubmit={handleSkillAdd} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a missing skill..."
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-indigo-500/50"
                />
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all">
                  Add
                </button>
              </form>

              <div className="flex flex-wrap gap-2">
                {editedData.extractedSkills.map(skill => (
                  <span key={skill} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs text-indigo-300">
                    {skill}
                    <button onClick={() => setEditedData(prev => ({ ...prev, extractedSkills: prev.extractedSkills.filter(s => s !== skill) }))}>
                      <X className="w-3 h-3 hover:text-red-400" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
              <Plus className="w-4 h-4" /> Tailor to Job
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 uppercase">Target Job Description</label>
                <textarea
                  value={editedData.jobDescriptionText}
                  onChange={e => setEditedData(prev => ({ ...prev, jobDescriptionText: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 min-h-[250px] resize-none focus:border-indigo-500/50 transition-all outline-none"
                  placeholder="Paste the job description here to optimize your match score..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
