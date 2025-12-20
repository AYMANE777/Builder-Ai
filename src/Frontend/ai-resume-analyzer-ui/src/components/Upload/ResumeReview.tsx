import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Phone, Tag, Check, X, 
    MapPin, Linkedin, Globe, Briefcase, 
    GraduationCap, Plus, Trash2, ChevronDown, ChevronUp,
    Languages, Award, FolderHeart, HeartHandshake, AlignLeft,
    ExternalLink
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
      company: 'New Company',
      role: 'New Role',
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
      school: 'New School',
      degree: 'New Degree',
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

  const removeVolunteering = (id: string) => {
    setEditedData(prev => ({ ...prev, volunteering: prev.volunteering.filter(v => v.id !== id) }));
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

  const removeLanguage = (id: string) => {
    setEditedData(prev => ({ ...prev, languages: prev.languages.filter(l => l.id !== id) }));
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

  const removeCertification = (id: string) => {
    setEditedData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== id) }));
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

  const removeProject = (id: string) => {
    setEditedData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
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
    <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/30 backdrop-blur-sm transition-all hover:border-indigo-500/30">
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
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/60 p-6 md:p-8 rounded-[2.5rem] border border-slate-800 backdrop-blur-2xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl shadow-indigo-500/20">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Review Extraction</h1>
            <p className="text-slate-400 font-medium">Please verify and edit the info found in your CV.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all border border-slate-700">
            Discard
          </button>
          <button 
            onClick={() => onAccept(editedData)}
            className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black transition-all shadow-2xl shadow-indigo-600/30 flex items-center gap-2"
          >
            <Check className="w-5 h-5" /> Start Full Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Main Sections */}
        <div className="lg:col-span-8 space-y-6">
            <SectionHeader id="personal" title="Personal Information" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editedData.extractedName}
                      onChange={e => setEditedData(prev => ({ ...prev, extractedName: e.target.value }))}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Job Title</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editedData.extractedJobTitle}
                      onChange={e => setEditedData(prev => ({ ...prev, extractedJobTitle: e.target.value }))}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={editedData.extractedEmail}
                      onChange={e => setEditedData(prev => ({ ...prev, extractedEmail: e.target.value }))}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Phone</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editedData.extractedPhone}
                      onChange={e => setEditedData(prev => ({ ...prev, extractedPhone: e.target.value }))}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">City</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editedData.extractedCity}
                      onChange={e => setEditedData(prev => ({ ...prev, extractedCity: e.target.value }))}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">LinkedIn</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editedData.extractedLinkedIn}
                      onChange={e => setEditedData(prev => ({ ...prev, extractedLinkedIn: e.target.value }))}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Website/Portfolio</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={editedData.extractedWebsite}
                      onChange={e => setEditedData(prev => ({ ...prev, extractedWebsite: e.target.value }))}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
            </SectionHeader>

            <SectionHeader id="experience" title="Work Experience" icon={Briefcase}>
              <div className="space-y-6">
                <button onClick={addWorkExperience} className="w-full p-4 bg-indigo-500/5 border border-dashed border-indigo-500/30 rounded-2xl text-indigo-400 hover:bg-indigo-500/10 transition-all flex items-center justify-center gap-2 group">
                  <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" /> 
                  <span className="text-sm font-black uppercase tracking-wider">Add Work Experience</span>
                </button>
                
                <div className="space-y-8">
                  {editedData.workExperiences.map(exp => (
                    <div key={exp.id} className="group relative p-8 bg-slate-950/40 border border-slate-800 rounded-3xl space-y-6 hover:border-slate-700 transition-all">
                      <button 
                        onClick={() => removeWorkExperience(exp.id)}
                        className="absolute top-6 right-6 p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-500 uppercase">Company</label>
                          <input
                            value={exp.company}
                            onChange={e => handleWorkExperienceChange(exp.id, 'company', e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-500 uppercase">Role</label>
                          <input
                            value={exp.role}
                            onChange={e => handleWorkExperienceChange(exp.id, 'role', e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] font-black text-slate-500 uppercase">Location</label>
                          <input
                            value={exp.location}
                            onChange={e => handleWorkExperienceChange(exp.id, 'location', e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase">Start Date</label>
                            <input
                              type="text"
                              placeholder="MM/YYYY"
                              value={exp.startDate}
                              onChange={e => handleWorkExperienceChange(exp.id, 'startDate', e.target.value)}
                              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-black text-slate-500 uppercase">End Date</label>
                            <input
                              type="text"
                              placeholder="MM/YYYY or Present"
                              value={exp.endDate}
                              onChange={e => handleWorkExperienceChange(exp.id, 'endDate', e.target.value)}
                              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500/50"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase">Responsibilities</label>
                        <textarea
                          value={exp.responsibilities}
                          onChange={e => handleWorkExperienceChange(exp.id, 'responsibilities', e.target.value)}
                          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-300 outline-none focus:border-indigo-500/50 min-h-[120px] resize-none leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </SectionHeader>

          <SectionHeader id="education" title="Education" icon={GraduationCap}>
            <div className="space-y-6">
              <button onClick={addEducation} className="w-full p-4 bg-indigo-500/5 border border-dashed border-indigo-500/30 rounded-2xl text-indigo-400 hover:bg-indigo-500/10 transition-all flex items-center justify-center gap-2 group">
                <Plus className="w-4 h-4 group-hover:scale-125 transition-transform" /> 
                <span className="text-sm font-black uppercase tracking-wider">Add Academic History</span>
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {editedData.education.map(edu => (
                  <div key={edu.id} className="relative p-6 bg-slate-950/40 border border-slate-800 rounded-3xl space-y-4 hover:border-slate-700 transition-all">
                    <button 
                      onClick={() => removeEducation(edu.id)}
                      className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="space-y-3">
                      <input
                        placeholder="University/School"
                        value={edu.school}
                        onChange={e => handleEducationChange(edu.id, 'school', e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none"
                      />
                      <input
                        placeholder="Degree / Diploma"
                        value={edu.degree}
                        onChange={e => handleEducationChange(edu.id, 'degree', e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SectionHeader id="languages" title="Languages" icon={Languages}>
              <div className="space-y-4">
                {editedData.languages.map(l => (
                  <div key={l.id} className="flex gap-2 items-center">
                    <input
                      placeholder="Language"
                      value={l.language}
                      onChange={e => handleLanguageChange(l.id, 'language', e.target.value)}
                      className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none"
                    />
                    <input
                      placeholder="Level"
                      value={l.fluency}
                      onChange={e => handleLanguageChange(l.id, 'fluency', e.target.value)}
                      className="w-24 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none"
                    />
                    <button onClick={() => removeLanguage(l.id)} className="p-2 text-slate-600 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={addLanguage} className="w-full p-2 text-indigo-400 text-xs font-bold hover:text-indigo-300">+ Add Language</button>
              </div>
            </SectionHeader>

            <SectionHeader id="certifications" title="Certifications" icon={Award}>
              <div className="space-y-4">
                {editedData.certifications.map(c => (
                  <div key={c.id} className="flex gap-2 items-center">
                    <input
                      placeholder="Certification Name"
                      value={c.name}
                      onChange={e => handleCertificationChange(c.id, 'name', e.target.value)}
                      className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white outline-none"
                    />
                    <button onClick={() => removeCertification(c.id)} className="p-2 text-slate-600 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={addCertification} className="w-full p-2 text-indigo-400 text-xs font-bold hover:text-indigo-300">+ Add Certification</button>
              </div>
            </SectionHeader>
          </div>
        </div>

        {/* Right Column - Skills & Target Job */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800 rounded-[2rem] p-8 space-y-8 sticky top-8">
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-3">
                <Tag className="w-4 h-4" /> Skills Detected
              </h3>
              
              <form onSubmit={handleSkillAdd} className="flex gap-3">
                <input
                  type="text"
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  className="flex-1 bg-slate-950/50 border border-slate-800 rounded-2xl px-5 py-3 text-sm text-white outline-none focus:border-indigo-500/50 transition-all"
                />
                <button type="submit" className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl transition-all shadow-lg shadow-indigo-600/20">
                  <Plus className="w-5 h-5" />
                </button>
              </form>

              <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {editedData.extractedSkills.map(skill => (
                  <motion.span 
                    layout
                    key={skill} 
                    className="flex items-center gap-2 pl-3 pr-2 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[11px] font-bold text-indigo-300 transition-all hover:bg-indigo-500/20"
                  >
                    {skill}
                    <button 
                      onClick={() => setEditedData(prev => ({ ...prev, extractedSkills: prev.extractedSkills.filter(s => s !== skill) }))}
                      className="p-1 hover:bg-indigo-500/20 rounded-lg transition-all"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-3">
                  <Globe className="w-4 h-4" /> Matching With
                </h3>
              </div>
              <textarea
                value={editedData.jobDescriptionText}
                onChange={e => setEditedData(prev => ({ ...prev, jobDescriptionText: e.target.value }))}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-[1.5rem] p-5 text-sm text-slate-400 min-h-[250px] resize-none focus:border-indigo-500/50 transition-all outline-none leading-relaxed"
                placeholder="Paste the target job description here to see how you match up..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
