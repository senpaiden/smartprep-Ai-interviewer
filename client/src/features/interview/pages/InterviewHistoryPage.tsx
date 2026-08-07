import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MessageSquare, ChevronRight, Filter } from 'lucide-react';
import api from '@/lib/api';
import type { Interview } from '@/types';

export default function InterviewHistoryPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/interviews/').then((res) => {
      const data = res.data.results || res.data;
      setInterviews(Array.isArray(data) ? data : []);
    }).catch(() => {
      setInterviews([]);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? interviews
    : interviews.filter(i => i.status === filter);

  const scoreColor = (score: number) =>
    score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Interview History</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              Review your past interview sessions
            </p>
          </div>
          <Link
            to="/interviews/setup"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary
              transition-all hover:scale-105"
          >
            New Interview
          </Link>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'completed', 'in_progress', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              filter === f ? 'bg-indigo-500 text-white' : 'glass-card'
            }`}
            style={filter !== f ? { color: 'var(--text-secondary)' } : {}}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No interviews found</p>
          <Link to="/interviews/setup" className="text-sm text-indigo-400 hover:text-indigo-300 mt-2 inline-block">
            Start your first interview →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((interview, idx) => (
            <motion.div
              key={interview.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                to={interview.status === 'completed'
                  ? `/interviews/${interview.id}/results`
                  : `/interviews/${interview.id}`
                }
                className="glass-card p-5 flex items-center justify-between group transition-all hover:scale-[1.01]"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: interview.status === 'completed' ? '#10b98115' : '#6366f115',
                    }}
                  >
                    <MessageSquare
                      className="w-6 h-6"
                      style={{
                        color: interview.status === 'completed' ? '#10b981' : '#6366f1',
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold capitalize" style={{ color: 'var(--text-primary)' }}>
                      {interview.interview_type?.replace('_', ' ')} Interview
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {new Date(interview.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs capitalize px-2 py-0.5 rounded" style={{
                        background: interview.status === 'completed' ? '#10b98115' : '#f59e0b15',
                        color: interview.status === 'completed' ? '#10b981' : '#f59e0b',
                      }}>
                        {interview.status?.replace('_', ' ')}
                      </span>
                      <span className="text-xs capitalize" style={{ color: 'var(--text-tertiary)' }}>
                        {interview.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {interview.status === 'completed' && (
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: scoreColor(interview.overall_score) }}>
                        {Math.round(interview.overall_score)}%
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Score</div>
                    </div>
                  )}
                  <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" style={{ color: 'var(--text-tertiary)' }} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
