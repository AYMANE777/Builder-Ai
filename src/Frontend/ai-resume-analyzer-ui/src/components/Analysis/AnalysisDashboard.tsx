import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Briefcase, GraduationCap, Languages, Award, 
  Send, Sparkles, Layout, Palette, Download,
  ChevronLeft, ChevronRight, Plus, Trash2,
  Mail, Phone, MapPin, Linkedin, Github, Globe,
  MessageSquare, History, Search, Settings,
  RotateCcw, Save
} from 'lucide-react';
import { AnalyzeResponse, WorkExperience, Education } from '../../lib/api';
import { cn } from '../../lib/utils';

interface Props {
  result: AnalyzeResponse;
  onReset: () => void;
}

export const AnalysisDashboard: React.FC<Props> = ({ result, onReset }) => {
  const [editedData, setEditedData] = useState<AnalyzeResponse>(result);
  const [chatMessage, setChatMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'content' | 'analysis'>('content');
  const [zoom, setZoom] = useState(80);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    // Chat logic would go here
    setChatMessage('');
  };

  return (
    <div className="fixed inset-0 top-[73px] bg-[#f8fafc] flex overflow-hidden text-slate-900">
      {/* Left Pane: Editor */}
      <div className="w-[400px] border-r border-slate-200 bg-white flex flex-col shadow-sm z-20">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Layout className="w-4 h-4 text-blue-600" /> Resume Content
          </h2>
          <div className="flex gap-2">
            <button className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors" title="Undo"><RotateCcw className="w-4 h-4 text-slate-500" /></button>
            <button className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors" title="Save"><Save className="w-4 h-4 text-slate-500" /></button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {/* Resume Analysis Summary (Top of Left Pane) */}
          <section className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Resume Analysis
              </h3>
              <ChevronRight className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
              Analyze your resume to get insights on its strengths and areas for improvement.
            </p>
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 text-white text-[10px] font-bold py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-1">
                Analyze Resume <ChevronRight className="w-3 h-3" />
              </button>
              <button className="flex-1 bg-white border border-blue-200 text-blue-600 text-[10px] font-bold py-2 rounded-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-1">
                Tailor to Job <Sparkles className="w-3 h-3" />
              </button>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-2">
                <InfoIcon className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] font-bold text-amber-800 uppercase">Recommended workflow</span>
              </div>
              <p className="text-[10px] text-amber-700">For optimal results, start by analyzing your resume to understand its current strengths.</p>
            </div>
          </section>

          {/* Personal Information */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" /> Personal Information
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Name</label>
                  <input 
                    type="text" 
                    value={editedData.extractedName} 
                    onChange={e => setEditedData({...editedData, extractedName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Job Title</label>
                  <input 
                    type="text" 
                    value={editedData.extractedJobTitle} 
                    onChange={e => setEditedData({...editedData, extractedJobTitle: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Email</label>
                  <input 
                    type="email" 
                    value={editedData.extractedEmail} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Phone</label>
                  <input 
                    type="text" 
                    value={editedData.extractedPhone} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">City</label>
                  <input 
                    type="text" 
                    value={editedData.extractedCity} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">LinkedIn</label>
                  <input 
                    type="text" 
                    value={editedData.extractedLinkedIn} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Work Experience */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" /> Work Experience
              </h3>
              <button className="text-blue-600 hover:text-blue-700 transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              {editedData.workExperiences?.map((exp, i) => (
                <div key={i} className="p-3 border border-slate-100 rounded-xl bg-slate-50/30 space-y-2 relative group">
                  <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"><Trash2 className="w-3.3" /></button>
                  <div className="font-bold text-xs">{exp.company}</div>
                  <div className="text-[10px] text-slate-500">{exp.role} • {exp.startDate} - {exp.endDate}</div>
                </div>
              ))}
              <button className="w-full py-2 border border-dashed border-slate-300 rounded-xl text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Plus className="w-3 h-3" /> Add Work Experience
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Middle Pane: Chat */}
      <div className="flex-1 flex flex-col bg-white border-r border-slate-200 shadow-sm relative z-10">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex gap-4">
            <button className="text-[11px] font-bold px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600">Clear</button>
            <button className="text-[11px] font-bold px-3 py-1.5 bg-slate-100 rounded-lg text-slate-600 flex items-center gap-1.5">
              <InfoIcon className="w-3 h-3" /> Report Bug
            </button>
            <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[11px] font-bold flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Tokens left: 30
            </div>
          </div>
          <button className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-[11px] font-bold hover:bg-rose-700 transition-all">Close Chat</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-slate-50/30">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs">JobSuit AI</span>
                <span className="text-[9px] text-slate-400 font-medium">8:53:11 PM</span>
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm text-sm text-slate-600 leading-relaxed max-w-md">
                Hi there! I can help you improve your resume. Ask me for feedback, or improvements for specific sections I can directly edit your resume.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 max-w-md mx-auto pt-8">
            <ChatOption icon={<TrendingUp className="w-4 h-4 text-amber-500" />} text="How does my resume compare to top candidates?" />
            <ChatOption icon={<Plus className="w-4 h-4 text-blue-500" />} text="Help me add a new experience to my resume" />
            <ChatOption icon={<Edit3 className="w-4 h-4 text-emerald-500" />} text="Help me improve an existing experience" />
            <ChatOption icon={<Search className="w-4 h-4 text-purple-500" />} text="Highlight the top keywords I'm missing" />
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSendMessage} className="relative">
            <input 
              type="text"
              placeholder="Message..."
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-4 pr-24 py-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><Mic className="w-5 h-5" /></button>
              <button type="submit" className="bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-95">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-3 font-medium">Messages are processed by AI. Verify important information.</p>
        </div>
      </div>

      {/* Right Pane: Preview */}
      <div className="flex-[1.2] bg-slate-200 flex flex-col relative overflow-hidden">
        <div className="h-[73px] bg-white border-b border-slate-100 flex items-center justify-between px-6 z-30">
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20">
              <Layout className="w-4 h-4" /> Templates
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20">
              <Palette className="w-4 h-4" /> Layout & Style
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-100 rounded-lg p-1">
              <button className="p-1.5 hover:bg-white rounded-md transition-all text-slate-500"><ChevronLeft className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-white rounded-md transition-all text-slate-500"><RotateCcw className="w-4 h-4" /></button>
              <button className="p-1.5 hover:bg-white rounded-md transition-all text-slate-500"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <button className="bg-slate-900 text-white px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg active:scale-95">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-12 flex justify-center custom-scrollbar">
          <div className="relative group/zoom">
             <div className="absolute top-0 right-[-60px] flex flex-col gap-2 opacity-0 group-hover/zoom:opacity-100 transition-opacity">
                <button onClick={() => setZoom(prev => prev + 10)} className="w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center hover:bg-slate-50 transition-all text-slate-600"><Plus className="w-5 h-5" /></button>
                <button onClick={() => setZoom(prev => prev - 10)} className="w-10 h-10 bg-white rounded-xl shadow-xl flex items-center justify-center hover:bg-slate-50 transition-all text-slate-600"><Minus className="w-5 h-5" /></button>
             </div>
             <div 
               style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
               className="bg-white shadow-2xl w-[800px] aspect-[1/1.41] p-16 flex flex-col gap-10 transition-transform duration-300"
             >
                {/* Visual Resume Template Content */}
                <div className="text-center space-y-2">
                  <h1 className="text-5xl font-black text-slate-900 tracking-tight uppercase">{editedData.extractedName || 'YOUR NAME'}</h1>
                  <div className="flex items-center justify-center gap-6 text-[10px] text-slate-500 font-bold tracking-widest uppercase">
                    <span className="flex items-center gap-2"><Mail className="w-3 h-3 text-blue-500" /> {editedData.extractedEmail}</span>
                    <span className="flex items-center gap-2"><Phone className="w-3 h-3 text-blue-500" /> {editedData.extractedPhone}</span>
                    <span className="flex items-center gap-2"><MapPin className="w-3 h-3 text-blue-500" /> {editedData.extractedCity}</span>
                    <span className="flex items-center gap-2 text-blue-600"><Linkedin className="w-3 h-3" /> Linkedin</span>
                    <span className="flex items-center gap-2 text-blue-600"><Github className="w-3 h-3" /> Github</span>
                  </div>
                </div>

                <div className="space-y-10">
                  <section className="space-y-4">
                    <h2 className="text-sm font-black text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-[0.2em]">À PROPOS DE MOI</h2>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Professionnel en {editedData.extractedJobTitle || 'Informatique'} avec une solide expérience dans le développement de solutions innovantes. Passionné par la technologie et l'excellence opérationnelle.
                    </p>
                  </section>

                  <section className="space-y-6">
                    <h2 className="text-sm font-black text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-[0.2em]">STAGES ET EXPÉRIENCES</h2>
                    <div className="space-y-8">
                      {editedData.workExperiences?.map((exp, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between items-baseline">
                            <h3 className="text-sm font-black text-slate-900">{exp.role} — {exp.company}</h3>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{exp.startDate} – {exp.endDate} | {exp.location}</span>
                          </div>
                          <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-1 font-medium">
                            {exp.responsibilities?.split('\n').map((r, ri) => (
                              <li key={ri}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h2 className="text-sm font-black text-slate-900 border-b-2 border-slate-900 pb-1 uppercase tracking-[0.2em]">ÉDUCATION</h2>
                    <div className="space-y-4">
                      {editedData.education?.map((edu, i) => (
                        <div key={i} className="flex justify-between items-baseline">
                          <div>
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{edu.school}</h3>
                            <p className="text-[10px] text-slate-500 font-bold">{edu.degree} {edu.fieldOfStudy}</p>
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{edu.endDate}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
             </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white p-2 flex items-center gap-4 z-40">
           <div className="flex items-center gap-2 px-4 border-r border-slate-200">
             <button onClick={() => setZoom(prev => prev - 5)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><Minus className="w-4 h-4" /></button>
             <span className="text-xs font-bold text-slate-600 min-w-[40px] text-center">{zoom}%</span>
             <button onClick={() => setZoom(prev => prev + 5)} className="p-1 hover:bg-slate-100 rounded text-slate-500"><Plus className="w-4 h-4" /></button>
           </div>
           <button onClick={() => setZoom(80)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><RotateCcw className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

const ChatOption: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <button className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 text-left hover:border-blue-300 hover:shadow-md transition-all group">
    <div className="p-2 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="text-[11px] font-bold text-slate-700">{text}</span>
    <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
  </button>
);

const InfoIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);

const Mic = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);

const Edit3 = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
);

const Minus = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" x2="19" y1="12" y2="12"/></svg>
);
