import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, ChevronRight, ChevronLeft, Info, 
  Eye, User, Briefcase, GraduationCap, 
  Mail, Phone, MapPin, Linkedin, Github,
  Upload
} from 'lucide-react';
import { AnalyzeResponse } from '../../lib/api';
import { cn } from '../../lib/utils';

interface Props {
  data: AnalyzeResponse;
  onAccept: (updatedData: AnalyzeResponse) => void;
  onCancel: () => void;
}

export const ResumeReview: React.FC<Props> = ({ data, onAccept, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(2); // Starting at Step 2 based on Image 2
  const [editedData, setEditedData] = useState<AnalyzeResponse>(data);
  const [photo, setPhoto] = useState<string | null>(null);

  const steps = [
    { id: 1, name: 'Contact Info' },
    { id: 2, name: 'Job Title' },
    { id: 3, name: 'Finalize' },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 flex flex-col gap-8">
      {/* Stepper */}
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0" />
          {steps.map((step) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all",
                currentStep >= step.id ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
              )}>
                {currentStep > step.id ? <Check className="w-6 h-6" /> : step.id}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 flex-1">
        {/* Left Side: Input Form */}
        <div className="space-y-8 flex flex-col">
          <div className="space-y-2">
            <h1 className="text-4xl font-extrabold tracking-tight">Job Title</h1>
            <p className="text-slate-500 text-lg font-medium">What specific job title is this resume for?</p>
          </div>

          <div className="space-y-6 flex-1">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 ml-1">Job Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Product Designer"
                value={editedData.extractedJobTitle || ''}
                onChange={(e) => setEditedData({ ...editedData, extractedJobTitle: e.target.value })}
                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-6 py-4 text-xl font-medium focus:outline-none focus:border-blue-500 transition-all shadow-sm"
              />
              <p className="text-sm text-slate-400 ml-1 italic">Please be specific. We'll use this to set the resume's target role.</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex gap-4">
              <div className="p-2 h-fit bg-amber-100 rounded-full">
                <Info className="w-5 h-5 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-amber-900">Why This Matters</h4>
                <p className="text-amber-800 text-sm leading-relaxed">Your job title determines how we analyze and optimize your resume:</p>
                <ul className="space-y-2 mt-3">
                  <li className="flex items-center gap-2 text-sm text-amber-700">
                    <ChevronRight className="w-4 h-4" /> Resume scoring and analysis
                  </li>
                  <li className="flex items-center gap-2 text-sm text-amber-700">
                    <ChevronRight className="w-4 h-4" /> Keyword matching for job applications
                  </li>
                  <li className="flex items-center gap-2 text-sm text-amber-700">
                    <ChevronRight className="w-4 h-4" /> Tailored recommendations and suggestions
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-blue-900">Parsing Complete</h4>
              </div>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  className="h-full bg-blue-600"
                />
              </div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Resume successfully processed.</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-slate-200">
            <button 
              onClick={onCancel}
              className="px-8 py-3 font-bold text-slate-500 hover:text-slate-700 transition-all"
            >
              Back
            </button>
            <button 
              onClick={() => onAccept(editedData)}
              className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              Import Resume <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Side: Preview */}
        <div className="relative group">
          <div className="absolute top-0 left-0 -translate-y-full mb-4 flex items-center gap-2 text-slate-400 font-bold text-sm uppercase tracking-widest">
            <Eye className="w-4 h-4" /> Preview
          </div>
          
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden aspect-[1/1.4] p-8 flex flex-col gap-6 sticky top-8">
            {/* Mock CV Content */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 uppercase">{editedData.extractedName || 'YOUR NAME'}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 font-bold">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {editedData.extractedPhone}</span>
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {editedData.extractedEmail}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {editedData.extractedCity}</span>
                </div>
                <div className="flex gap-4 pt-1">
                  <Linkedin className="w-3 h-3 text-slate-400" />
                  <Github className="w-3 h-3 text-slate-400" />
                </div>
              </div>
              <div className="relative group/photo">
                <div className="w-24 h-24 bg-slate-100 rounded-2xl overflow-hidden border-2 border-slate-50 flex items-center justify-center">
                  {photo ? (
                    <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/photo:opacity-100 flex items-center justify-center cursor-pointer transition-opacity rounded-2xl">
                  <Upload className="w-6 h-6 text-white" />
                  <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                </label>
              </div>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <section className="space-y-2">
                <h3 className="text-xs font-black border-b-2 border-slate-900 pb-1 uppercase tracking-widest text-slate-900">Summary</h3>
                <p className="text-xs leading-relaxed text-slate-600 font-medium">
                  Professional with experience in {editedData.extractedJobTitle || 'their field'}, dedicated to delivering high-quality results and continuous improvement.
                </p>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-black border-b-2 border-slate-900 pb-1 uppercase tracking-widest text-slate-900">Experience</h3>
                <div className="space-y-4">
                  {editedData.workExperiences?.map((exp, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-[11px] font-bold text-slate-900">{exp.role}</h4>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{exp.startDate} - {exp.endDate}</span>
                      </div>
                      <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase">
                        <span>{exp.company}</span>
                        <span>{exp.location}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight whitespace-pre-wrap">{exp.responsibilities?.split('\n')[0]}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-xs font-black border-b-2 border-slate-900 pb-1 uppercase tracking-widest text-slate-900">Education</h3>
                <div className="space-y-2">
                  {editedData.education?.map((edu, i) => (
                    <div key={i} className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h4 className="text-[10px] font-bold text-slate-900">{edu.school}</h4>
                        <p className="text-[9px] text-slate-500 font-medium">{edu.degree} {edu.fieldOfStudy}</p>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{edu.endDate}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
