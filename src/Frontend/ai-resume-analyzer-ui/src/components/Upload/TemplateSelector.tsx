import React from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Template {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  isDefault?: boolean;
  font: string;
}

const templates: Template[] = [
  {
    id: 'standard',
    name: 'Standard',
    description: 'Clean, professional single-column layout',
    previewUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/template_standard.png', // Placeholder
    isDefault: true,
    font: 'Arial, sans-serif'
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Two-column layout with sidebar for contact info',
    previewUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/template_modern.png', // Placeholder
    font: 'Arial, sans-serif'
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Timeline-based design with icons and visual elements',
    previewUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/template_creative.png', // Placeholder
    font: 'Arial, sans-serif'
  },
  {
    id: 'classic',
    name: 'Classic',
    description: 'Traditional format with clean typography',
    previewUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/template_classic.png', // Placeholder
    font: 'Arial, sans-serif'
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Professional layout with clear section divisions',
    previewUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/template_balanced.png', // Placeholder
    font: 'Arial, sans-serif'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean, modern design with subtle borders and spacing',
    previewUrl: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/template_minimalist.png', // Placeholder
    font: 'Arial, sans-serif'
  }
];

interface Props {
  onSelect: (templateId: string) => void;
  onCancel: () => void;
}

export const TemplateSelector: React.FC<Props> = ({ onSelect, onCancel }) => {
  const [selected, setSelected] = React.useState('standard');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl overflow-hidden text-slate-900"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Choose Resume Template</h2>
            <span className="px-3 py-1 bg-slate-100 rounded-full text-sm font-medium text-slate-500">
              Showing template previews with sample data
            </span>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[70vh] overflow-y-auto">
          {templates.map((template) => (
            <div
              key={template.id}
              onClick={() => setSelected(template.id)}
              className={cn(
                "relative group cursor-pointer border-2 rounded-2xl transition-all duration-300 overflow-hidden",
                selected === template.id 
                  ? "border-blue-500 ring-4 ring-blue-500/10 shadow-xl" 
                  : "border-slate-200 hover:border-slate-300 shadow-sm"
              )}
            >
              <div className="p-5 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-lg">{template.name}</h3>
                  {template.isDefault && (
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Default</span>
                  )}
                </div>
                <div className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                  selected === template.id ? "bg-blue-500 border-blue-500" : "border-slate-300"
                )}>
                  {selected === template.id && <Check className="w-4 h-4 text-white" />}
                </div>
              </div>
              
              <div className="px-5 pb-4">
                <p className="text-sm text-slate-500 line-clamp-1">{template.description}</p>
              </div>

              <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden mx-5 mb-5 rounded-lg border border-slate-100 group-hover:shadow-md transition-all">
                {/* Mock Template Preview */}
                <div className="absolute inset-0 p-8 flex flex-col gap-4">
                  <div className="h-4 w-1/3 bg-slate-200 rounded animate-pulse" />
                  <div className="h-2 w-full bg-slate-100 rounded animate-pulse" />
                  <div className="h-2 w-5/6 bg-slate-100 rounded animate-pulse" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 w-1/4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-2 w-full bg-slate-100 rounded animate-pulse" />
                    <div className="h-2 w-full bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
                {/* Overlay for selected state */}
                {selected === template.id && (
                  <div className="absolute inset-0 bg-blue-500/5 transition-opacity" />
                )}
              </div>

              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 font-medium">
                  Default font: <span className="text-slate-600">{template.font}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onSelect(selected)}
            className="px-8 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            Apply Template
          </button>
        </div>
      </motion.div>
    </div>
  );
};
