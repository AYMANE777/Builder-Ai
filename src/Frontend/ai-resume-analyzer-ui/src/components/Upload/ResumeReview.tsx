import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Phone, Tag, Check, X, 
    MapPin, Linkedin, Globe, Briefcase, 
    GraduationCap, Plus, Trash2, ChevronDown, ChevronUp,
    Languages, Award, FolderHeart, HeartHandshake, AlignLeft
  } from 'lucide-react';
import { AnalyzeResponse, WorkExperience, Education, Volunteering, LanguageInfo, Certification, Project } from '../../lib/api';

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
    volunteering: data.volunteering || [],
    languages: data.languages || [],
    certifications: data.certifications || [],
    projects: data.projects || [],
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
      id: Math.random().toString(36).substr(2, 9),
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
      id: Math.random().toString(36).substr(2, 9),
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

  const handleVolunteeringChange = (id: string, field: keyof Volunteering, value: string) => {
    setEditedData(prev => ({
      ...prev,
      volunteering: prev.volunteering.map(v => v.id === id ? { ...v, [field]: value } : v)
    }));
  };

  const addVolunteering = () => {
    const newItem: Volunteering = { id: Math.random().toString(36).substr(2, 9), organization: '', role: '', startDate: '', endDate: '', description: '' };
    setEditedData(prev => ({ ...prev, volunteering: [newItem, ...prev.volunteering] }));
  };

  const handleLanguageChange = (id: string, field: keyof LanguageInfo, value: string) => {
    setEditedData(prev => ({
      ...prev,
      languages: prev.languages.map(l => l.id === id ? { ...l, [field]: value } : l)
    }));
  };

  const addLanguage = () => {
    const newItem: LanguageInfo = { id: Math.random().toString(36).substr(2, 9), language: '', fluency: '' };
    setEditedData(prev => ({ ...prev, languages: [newItem, ...prev.languages] }));
  };

  const handleCertificationChange = (id: string, field: keyof Certification, value: string) => {
    setEditedData(prev => ({
      ...prev,
      certifications: prev.certifications.map(c => c.id === id ? { ...c, [field]: value } : c)
    }));
  };

  const addCertification = () => {
    const newItem: Certification = { id: Math.random().toString(36).substr(2, 9), name: '', issuer: '', date: '' };
    setEditedData(prev => ({ ...prev, certifications: [newItem, ...prev.certifications] }));
  };

  const handleProjectChange = (id: string, field: keyof Project, value: string) => {
    setEditedData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const addProject = () => {
    const newItem: Project = { id: Math.random().toString(36).substr(2, 9), title: '', description: '', date: '', link: '' };
    setEditedData(prev => ({ ...prev, projects: [newItem, ...prev.projects] }));
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
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Professional Summary</label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-3.5 w-4 h-4 text-slate-600" />
                  <textarea
                    value={editedData.extractedSummary}
                    onChange={e => setEditedData(prev => ({ ...prev, extractedSummary: e.target.value }))}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none min-h-[120px] resize-none"
                  />
                </div>
              </div>

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
            </div>
          </SectionHeader>

          <SectionHeader id="experience" title="Work Experience" icon={Briefcase}>
            <div className="space-y-6">
              <button onClick={addWorkExperience} className="w-full p-4 bg-slate-950/30 border border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> <span className="text-sm font-bold">Add Work Experience</span>
              </button>
              {editedData.workExperiences.map(exp => (
                <div key={exp.id} className="p-6 bg-slate-950/30 border border-slate-800 rounded-2xl space-y-4">
                  <input
                    placeholder="Company"
                    value={exp.company}
                    onChange={e => handleWorkExperienceChange(exp.id, 'company', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none"
                  />
                  <input
                    placeholder="Role"
                    value={exp.role}
                    onChange={e => handleWorkExperienceChange(exp.id, 'role', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none"
                  />
                  <textarea
                    placeholder="Responsibilities"
                    value={exp.responsibilities}
                    onChange={e => handleWorkExperienceChange(exp.id, 'responsibilities', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none min-h-[80px]"
                  />
                </div>
              ))}
            </div>
          </SectionHeader>

          <SectionHeader id="education" title="Education" icon={GraduationCap}>
            <div className="space-y-6">
              <button onClick={addEducation} className="w-full p-4 bg-slate-950/30 border border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> <span className="text-sm font-bold">Add Education</span>
              </button>
              {editedData.education.map(edu => (
                <div key={edu.id} className="p-6 bg-slate-950/30 border border-slate-800 rounded-2xl space-y-4">
                  <input
                    placeholder="School"
                    value={edu.school}
                    onChange={e => handleEducationChange(edu.id, 'school', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none"
                  />
                  <input
                    placeholder="Degree"
                    value={edu.degree}
                    onChange={e => handleEducationChange(edu.id, 'degree', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none"
                  />
                </div>
              ))}
            </div>
          </SectionHeader>

          <SectionHeader id="volunteering" title="Volunteering & Leadership" icon={HeartHandshake}>
            <div className="space-y-6">
              <button onClick={addVolunteering} className="w-full p-4 bg-slate-950/30 border border-dashed border-slate-700 rounded-xl text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> <span className="text-sm font-bold">Add Item</span>
              </button>
              {editedData.volunteering.map(v => (
                <div key={v.id} className="p-6 bg-slate-950/30 border border-slate-800 rounded-2xl space-y-4">
                  <input
                    placeholder="Organization"
                    value={v.organization}
                    onChange={e => handleVolunteeringChange(v.id, 'organization', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none"
                  />
                  <textarea
                    placeholder="Description"
                    value={v.description}
                    onChange={e => handleVolunteeringChange(v.id, 'description', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white outline-none min-h-[80px]"
                  />
                </div>
              ))}
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
                  placeholder="Add skill..."
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
              <Plus className="w-4 h-4" /> Target Role
            </h3>
            <textarea
              value={editedData.jobDescriptionText}
              onChange={e => setEditedData(prev => ({ ...prev, jobDescriptionText: e.target.value }))}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 min-h-[200px] resize-none focus:border-indigo-500/50 transition-all outline-none"
              placeholder="Paste job description..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
