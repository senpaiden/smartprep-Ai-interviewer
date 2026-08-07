import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Code2, Brain, MessageSquare, Building2,
  Settings, Loader2, Sparkles, Mic
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { InterviewType, Difficulty } from '@/types';

const interviewTypes = [
  { type: 'hr' as InterviewType, icon: Users, label: 'HR Interview', desc: 'Behavioral & situational questions', color: '#6366f1' },
  { type: 'technical' as InterviewType, icon: Brain, label: 'Technical', desc: 'In-depth technical knowledge', color: '#22d3ee' },
  { type: 'coding' as InterviewType, icon: Code2, label: 'Coding', desc: 'Problem solving & algorithms', color: '#10b981' },
  { type: 'behavioral' as InterviewType, icon: MessageSquare, label: 'Behavioral', desc: 'STAR method questions', color: '#f59e0b' },
  { type: 'company_specific' as InterviewType, icon: Building2, label: 'Company Specific', desc: 'Targeted preparation', color: '#8b5cf6' },
  { type: 'custom' as InterviewType, icon: Settings, label: 'Custom', desc: 'Build your own interview', color: '#ec4899' },
];

const difficulties: { value: Difficulty; label: string; color: string }[] = [
  { value: 'easy', label: 'Easy', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'hard', label: 'Hard', color: '#ef4444' },
];

const techOptions = [
  'React', 'Node.js', 'Python', 'Java', 'C++', 'JavaScript', 'TypeScript',
  'Django', 'Spring Boot', 'AWS', 'Docker', 'SQL', 'MongoDB', 'System Design',
  'Data Structures', 'Machine Learning', 'Kubernetes', 'GraphQL',
];

export default function InterviewSetupPage() {
  const [selectedType, setSelectedType] = useState<InterviewType>('technical');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [duration, setDuration] = useState(30);
  const [techStack, setTechStack] = useState<string[]>([]);
  const [voiceMode, setVoiceMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleTech = (tech: string) => {
    setTechStack(prev =>
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await api.post('/interviews/start/', {
        interview_type: selectedType,
        difficulty,
        total_questions: totalQuestions,
        duration_minutes: duration,
        tech_stack: techStack,
        language: 'English',
      });
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
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Configure your mock interview session</p>
      </motion.div>

      {/* Interview Type */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Interview Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {interviewTypes.map((type) => (
            <button
              key={type.type}
              onClick={() => setSelectedType(type.type)}
              className={`glass-card p-5 text-left transition-all hover:scale-[1.02] ${
                selectedType === type.type ? 'ring-2 ring-indigo-500' : ''
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${type.color}15` }}
              >
                <type.icon className="w-5 h-5" style={{ color: type.color }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{type.label}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>{type.desc}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Difficulty */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Difficulty</h2>
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
      </motion.div>

      {/* Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass-card p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Questions: {totalQuestions}
            </label>
            <input
              type="range" min="3" max="20" value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              <span>3</span><span>20</span>
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

        <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`relative w-12 h-6 rounded-full transition-colors ${voiceMode ? 'bg-indigo-500' : 'bg-white/10'}`}>
              <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${voiceMode ? 'translate-x-6' : 'translate-x-0'}`} />
            </div>
            <div className="flex items-center gap-2">
              <Mic className={`w-5 h-5 ${voiceMode ? 'text-indigo-400' : 'text-white/40'}`} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Enable Voice Mode</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Interact with AI via speech-to-text and text-to-speech</p>
              </div>
            </div>
            {/* hidden input so state updates easily */}
            <input type="checkbox" className="hidden" checked={voiceMode} onChange={(e) => setVoiceMode(e.target.checked)} />
          </label>
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Technology Stack (optional)</h2>
        <div className="flex flex-wrap gap-2">
          {techOptions.map((tech) => (
            <button
              key={tech}
              onClick={() => toggleTech(tech)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                techStack.includes(tech)
                  ? 'bg-indigo-500 text-white'
                  : 'glass-card'
              }`}
              style={techStack.includes(tech) ? {} : { color: 'var(--text-secondary)' }}
            >
              {tech}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Start Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-base font-semibold text-white gradient-primary
            transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/25
            disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Preparing Interview...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Start Interview</>
          )}
        </button>
      </motion.div>
    </div>
  );
}
