import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, Search, Trophy, Clock, Brain, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

export default function CodingChallengePage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/coding/challenges/')
      .then((res) => setChallenges(res.data.results || res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const difficultyColors: Record<string, string> = {
    easy: '#10b981',
    medium: '#f59e0b',
    hard: '#ef4444',
  };

  const filtered = filter === 'all' 
    ? challenges 
    : challenges.filter(c => c.difficulty === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--text-primary)' }}>
              <Code2 className="w-8 h-8 text-indigo-400" /> Coding Challenges
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
              Master data structures and algorithms with our interactive code editor.
            </p>
          </div>
          
          <div className="flex gap-2">
            {['all', 'easy', 'medium', 'hard'].map((d) => (
              <button
                key={d}
                onClick={() => setFilter(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all
                  ${filter === d ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'glass-card'}`}
                style={filter !== d ? { color: 'var(--text-secondary)' } : {}}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-6 flex flex-col group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Code2 className="w-16 h-16" style={{ color: difficultyColors[c.difficulty] }} />
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider" 
                  style={{ background: `${difficultyColors[c.difficulty]}15`, color: difficultyColors[c.difficulty] }}>
                  {c.difficulty}
                </span>
                <span className="text-xs px-2 py-1 rounded-md bg-white/5 text-white/50 capitalize">
                  {c.category?.replace('_', ' ')}
                </span>
              </div>
              
              <h3 className="text-lg font-bold mb-2 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                {c.title}
              </h3>
              
              <p className="text-sm line-clamp-2 mb-6 flex-1" style={{ color: 'var(--text-secondary)' }}>
                {c.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  {c.acceptance_rate}% Acceptance
                </div>
                <Link
                  to={`/coding/${c.id}`}
                  className="text-sm font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors flex items-center gap-1"
                >
                  Solve Challenge <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center glass-card rounded-2xl">
              <p style={{ color: 'var(--text-secondary)' }}>No challenges found for this filter.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Simple internal chevron component for this file
function ChevronRight({ className, style }: any) {
  return (
    <svg className={className} style={style} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
