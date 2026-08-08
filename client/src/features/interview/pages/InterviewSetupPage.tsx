import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Code2, Brain, Layout, Server, Cloud, Database, BarChart3,
  Palette, Smartphone, Shield, Briefcase, Cpu,
  Settings, Loader2, Sparkles, Mic, FileText, ChevronRight,
  User, AlertTriangle,
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { InterviewType, Difficulty, InterviewRole, CandidateProfile } from '@/types';

interface RoleOption {
  id: InterviewRole;
  label: string;
  icon: any;
  color: string;
  type: InterviewType;
  defaultTech: string[];
}

const roles: RoleOption[] = [
  { id: 'full-stack', label: 'Full Stack Engineer', icon: Code2, color: '#6366f1', type: 'technical', defaultTech: ['React', 'Node.js', 'Python', 'SQL', 'Docker'] },
  { id: 'ai-ml', label: 'AI/ML Engineer', icon: Brain, color: '#8b5cf6', type: 'technical', defaultTech: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch'] },
  { id: 'frontend', label: 'Frontend Developer', icon: Layout, color: '#06b6d4', type: 'technical', defaultTech: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'] },
  { id: 'backend', label: 'Backend Developer', icon: Server, color: '#10b981', type: 'technical', defaultTech: ['Python', 'Java', 'SQL', 'Docker', 'REST APIs'] },
  { id: 'devops', label: 'DevOps Engineer', icon: Cloud, color: '#f59e0b', type: 'technical', defaultTech: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'] },
  { id: 'data-engineer', label: 'Data Engineer', icon: Database, color: '#ec4899', type: 'technical', defaultTech: ['Python', 'SQL', 'Spark', 'Airflow', 'ETL'] },
  { id: 'data-scientist', label: 'Data Scientist', icon: BarChart3, color: '#14b8a6', type: 'technical', defaultTech: ['Python', 'R', 'Machine Learning', 'Statistics', 'Pandas'] },
  { id: 'ui-ux', label: 'UI/UX Designer', icon: Palette, color: '#f43f5e', type: 'behavioral', defaultTech: ['Figma', 'Adobe XD', 'CSS', 'Design Systems'] },
  { id: 'mobile', label: 'Mobile Developer', icon: Smartphone, color: '#3b82f6', type: 'technical', defaultTech: ['React Native', 'Swift', 'Kotlin', 'Flutter'] },
  { id: 'cloud-architect', label: 'Cloud Architect', icon: Cpu, color: '#a855f7', type: 'technical', defaultTech: ['AWS', 'Azure', 'Terraform', 'Microservices'] },
  { id: 'cybersecurity', label: 'Cybersecurity Engineer', icon: Shield, color: '#ef4444', type: 'technical', defaultTech: ['Network Security', 'Cryptography', 'Penetration Testing', 'SIEM'] },
  { id: 'product-manager', label: 'Product Manager', icon: Briefcase, color: '#0ea5e9', type: 'behavioral', defaultTech: [] },
];

const difficulties: { value: Difficulty; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'hard', label: 'Hard', color: '#ef4444' },
];

export default function InterviewSetupPage() {
  const [mode, setMode] = useState<'role' | 'candidate'>('role');
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleOption | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [totalQuestions, setTotalQuestions] = useState(8);
  const [duration, setDuration] = useState(30);
  const [voiceMode, setVoiceMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/interviews/candidates/').then(res => {
      setCandidates(res.data.candidates || []);
    }).catch(() => {});

    api.get('/resumes/?limit=1').then(res => {
      const resumes = res.data.results || res.data;
      if (Array.isArray(resumes) && resumes.length > 0) {
        setHasResume(resumes[0].status === 'analyzed');
      }
    }).catch(() => {});
  }, []);

  const handleStart = async () => {
    if (mode === 'candidate' && !selectedCandidate) {
      toast.error('Please select a candidate');
      return;
    }
    if (mode === 'role' && !selectedRole) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        interview_type: mode === 'candidate' ? 'technical' : selectedRole!.type,
        difficulty,
        total_questions: totalQuestions,
        duration_minutes: duration,
        tech_stack: mode === 'candidate' ? [selectedCandidate!.jobRole] : selectedRole!.defaultTech,
        language: 'English',
        role: mode === 'candidate' ? selectedCandidate!.jobRole : selectedRole!.id,
      };

      if (mode === 'candidate') {
        payload.candidate_id = selectedCandidate!.id;
      }

      const res = await api.post('/interviews/start/', payload);
      if (voiceMode) {
        navigate(`/interviews/${res.data.interview.id}/voice`);
      } else {
        navigate(`/interviews/${res.data.interview.id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>New Interview</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Choose your interview mode and get started</p>
      </motion.div>

      {/* Mode Toggle */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex gap-2 p-1 rounded-xl glass-card w-fit">
          <button
            onClick={() => setMode('role')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === 'role' ? 'bg-indigo-500 text-white' : ''
            }`}
            style={mode !== 'role' ? { color: 'var(--text-secondary)' } : {}}
          >
            Role-Based
          </button>
          <button
            onClick={() => setMode('candidate')}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              mode === 'candidate' ? 'bg-indigo-500 text-white' : ''
            }`}
            style={mode !== 'candidate' ? { color: 'var(--text-secondary)' } : {}}
          >
            AI Cohort Candidate
          </button>
        </div>
      </motion.div>

      {/* Candidate Mode */}
      {mode === 'candidate' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Select Candidate</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {candidates.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCandidate(c)}
                className={`glass-card p-5 text-left transition-all hover:scale-[1.01] ${
                  selectedCandidate?.id === c.id ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{c.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.jobRole} • {c.yearsExperience}y exp</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{c.education}</p>
                    {c.weak_topics.length > 0 && (
                      <div className="mt-2 flex items-start gap-1.5">
                        <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-amber-400">{c.weak_topics.slice(0, 2).join(', ')}{c.weak_topics.length > 2 ? ` +${c.weak_topics.length - 2}` : ''}</p>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Candidate Info */}
      {mode === 'candidate' && selectedCandidate && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 border border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <Brain className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Interviewing: {selectedCandidate.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {selectedCandidate.missionsCount} missions completed • {selectedCandidate.weak_topics.length} weak areas identified
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Role Mode */}
      {mode === 'role' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Select Role</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`glass-card p-5 text-left transition-all hover:scale-[1.02] ${
                  selectedRole?.id === role.id ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${role.color}15` }}
                >
                  <role.icon className="w-5 h-5" style={{ color: role.color }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{role.label}</p>
                {role.defaultTech.length > 0 && (
                  <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-tertiary)' }}>
                    {role.defaultTech.slice(0, 3).join(', ')}{role.defaultTech.length > 3 ? ` +${role.defaultTech.length - 3}` : ''}
                  </p>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Resume Badge (role mode only) */}
      {mode === 'role' && hasResume && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-3 flex items-center gap-3 border border-emerald-500/20">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Resume detected</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Your resume data will personalize the interview questions</p>
          </div>
        </motion.div>
      )}

      {/* Selected Config */}
      {((mode === 'role' && selectedRole) || (mode === 'candidate' && selectedCandidate)) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 space-y-6">
          
          {/* Role Info (role mode) */}
          {mode === 'role' && selectedRole && (
            <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${selectedRole.color}15` }}>
                <selectedRole.icon className="w-5 h-5" style={{ color: selectedRole.color }} />
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedRole.label}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Interview type: {selectedRole.type} | {selectedRole.defaultTech.length} technologies
                </p>
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Difficulty</label>
            <div className="flex gap-3">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                    difficulty === d.value ? 'ring-2' : 'glass-card'
                  }`}
                  style={{
                    background: difficulty === d.value ? `${d.color}15` : undefined,
                    color: difficulty === d.value ? d.color : 'var(--text-secondary)',
                    '--tw-ring-color': d.color,
                  } as React.CSSProperties}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Questions: {totalQuestions}
              </label>
              <input
                type="range" min="8" max="20" value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                <span>8</span><span>20</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Duration: {duration} min
              </label>
              <input
                type="range" min="10" max="60" step="5" value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                <span>10 min</span><span>60 min</span>
              </div>
            </div>
          </div>

          {/* Voice Mode */}
          <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`relative w-12 h-6 rounded-full transition-colors ${voiceMode ? 'bg-indigo-500' : 'bg-white/10'}`}>
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${voiceMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </div>
              <div className="flex items-center gap-2">
                <Mic className={`w-5 h-5 ${voiceMode ? 'text-indigo-400' : 'text-white/40'}`} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Enable Voice Mode</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Interact via speech-to-text and text-to-speech</p>
                </div>
              </div>
              <input type="checkbox" className="hidden" checked={voiceMode} onChange={(e) => setVoiceMode(e.target.checked)} />
            </label>
          </div>
        </motion.div>
      )}

      {/* Start Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <button
          onClick={handleStart}
          disabled={loading || (mode === 'role' && !selectedRole) || (mode === 'candidate' && !selectedCandidate)}
          className="w-full py-4 rounded-2xl text-base font-semibold text-white gradient-primary
            transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/25
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Preparing Interview...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Start Interview<ChevronRight className="w-4 h-4" /></>
          )}
        </button>
      </motion.div>
    </div>
  );
}
