import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Sparkles, Loader2, AlertCircle, CheckCircle2, X, Star } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { Resume } from '@/types';

export default function ResumeAnalyzerPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    api.get('/resumes/').then((res) => {
      setResumes(res.data.results || res.data);
      if (res.data.results?.length || res.data?.length) {
        const list = res.data.results || res.data;
        const analyzed = list.find((r: Resume) => r.status === 'analyzed');
        if (analyzed) setSelectedResume(analyzed);
      }
    }).catch(() => {});
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.pdf')) {
      toast.error('Only PDF files are allowed');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/resumes/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newResume = res.data;
      setResumes(prev => [newResume, ...prev]);
      toast.success('Resume uploaded!');

      // Auto-analyze
      setAnalyzing(true);
      const analysisRes = await api.post(`/resumes/${newResume.id}/analyze/`);
      setSelectedResume(analysisRes.data);
      setResumes(prev => prev.map(r => r.id === newResume.id ? analysisRes.data : r));
      toast.success('Analysis complete!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = ''; // Reset input so same file can be uploaded again
  };

  const r = selectedResume;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Resume Analyzer</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Upload your resume for AI-powered analysis</p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div
          className={`glass-card p-8 border-2 border-dashed text-center cursor-pointer transition-all ${dragOver ? 'border-indigo-500 bg-indigo-500/5' : ''}`}
          style={{ borderColor: dragOver ? '#6366f1' : 'var(--border)' }}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('resume-input')?.click()}
        >
          <input id="resume-input" type="file" accept=".pdf" className="hidden" onChange={handleFileInput} />

          {uploading || analyzing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {analyzing ? 'AI is analyzing your resume...' : 'Uploading...'}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                This may take a moment
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Drag & drop your resume here
                </p>
                <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-tertiary)' }}>
                  PDF only, max 5MB
                </p>
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById('resume-input')?.click();
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <Upload size={16} />
                  Browse Files
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Analysis Results */}
      <AnimatePresence>
        {r && r.status === 'analyzed' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Score Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* ATS Score */}
              <div className="glass-card p-6 text-center">
                <div className="relative w-28 h-28 mx-auto mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="45" fill="none"
                      stroke={r.ats_score >= 70 ? '#10b981' : r.ats_score >= 40 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(r.ats_score / 100) * 283} 283`}
                      style={{ animation: 'score-fill 1.5s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{r.ats_score}</span>
                  </div>
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>ATS Score</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>Applicant Tracking System compatibility</p>
              </div>

              {/* Resume Rating */}
              <div className="glass-card p-6 text-center flex flex-col items-center justify-center">
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      className="w-7 h-7"
                      fill={i <= Math.round(r.resume_rating) ? '#f59e0b' : 'transparent'}
                      stroke={i <= Math.round(r.resume_rating) ? '#f59e0b' : 'var(--text-tertiary)'}
                    />
                  ))}
                </div>
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{r.resume_rating}/5</p>
                <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>Resume Rating</p>
              </div>

              {/* Summary Stats */}
              <div className="glass-card p-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Skills Found</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.technical_skills.length + r.soft_skills.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Projects</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{r.projects.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Missing Skills</span>
                  <span className="font-semibold text-amber-400">{r.missing_skills.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Grammar Issues</span>
                  <span className="font-semibold text-red-400">{r.grammar_issues.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Suggestions</span>
                  <span className="font-semibold text-cyan-400">{r.improvement_suggestions.length}</span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Technical Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {r.technical_skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" /> Soft Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {r.soft_skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Issues & Suggestions */}
            {r.improvement_suggestions.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Sparkles className="w-5 h-5 text-amber-400" /> Improvement Suggestions
                </h3>
                <div className="space-y-3">
                  {r.improvement_suggestions.map((suggestion, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                      <span className="text-amber-400 font-bold text-sm">{i + 1}.</span>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {r.missing_skills.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <AlertCircle className="w-5 h-5 text-red-400" /> Missing Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {r.missing_skills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
