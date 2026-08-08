import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Award, TrendingUp, MessageSquare, Brain,
  ArrowLeft, ChevronDown, ChevronUp, CheckCircle2, AlertCircle,
  BookOpen, Lightbulb, Target, ThumbsUp, Globe,
} from 'lucide-react';
import api from '@/lib/api';
import type { Interview } from '@/types';

export default function InterviewResultPage() {
  const { id } = useParams<{ id: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  useEffect(() => {
    api.get(`/interviews/${id}/`).then((res) => {
      setInterview(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-32 rounded-2xl" />)}
      </div>
    );
  }

  if (!interview) return <div className="text-center py-20" style={{ color: 'var(--text-secondary)' }}>Interview not found.</div>;

  const i = interview;
  const summary = i.ai_summary;

  const scoreColor = (score: number) =>
    score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  const hireColor = (rec: string) => {
    if (rec?.includes('Strong Hire')) return '#10b981';
    if (rec?.includes('Hire')) return '#22d3ee';
    if (rec?.includes('Maybe')) return '#f59e0b';
    return '#ef4444';
  };

  const scores = [
    { label: 'Overall', score: i.overall_score, icon: Award },
    { label: 'Technical', score: i.technical_score, icon: Brain },
    { label: 'Communication', score: i.communication_score, icon: MessageSquare },
    { label: 'Confidence', score: i.confidence_score, icon: TrendingUp },
    { label: 'English Fluency', score: i.english_fluency_score, icon: Globe },
    { label: 'Grammar', score: i.grammar_score, icon: CheckCircle2 },
    { label: 'Problem Solving', score: i.problem_solving_score, icon: AlertCircle },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/interviews" className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>

        <div className="glass-card p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 gradient-primary opacity-5" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <Award className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Interview Results</h1>
            <p className="text-sm capitalize mb-8" style={{ color: 'var(--text-secondary)' }}>
              {i.role ? `${i.role} • ` : ''}{i.interview_type.replace('_', ' ')} Interview • {i.difficulty} difficulty
            </p>

            {/* Big Score */}
            <div className="mt-8">
              <div className="relative w-36 h-36 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={scoreColor(i.overall_score)}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${(i.overall_score / 100) * 283} 283`}
                    style={{ animation: 'score-fill 1.5s ease-out' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold" style={{ color: scoreColor(i.overall_score) }}>
                    {Math.round(i.overall_score)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>/ 100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Summary Report */}
      {summary && summary.overall_feedback && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <BookOpen className="w-5 h-5 text-indigo-400" /> AI Performance Report
          </h2>

          <div className="space-y-4">
            {/* Overall Feedback */}
            <div className="glass-card p-6">
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                {summary.overall_feedback}
              </p>
              {summary.hire_recommendation && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Hire Recommendation:</span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold text-white"
                    style={{ background: hireColor(summary.hire_recommendation) }}>
                    {summary.hire_recommendation}
                  </span>
                </div>
              )}
            </div>

            {/* Strengths */}
            {summary.top_strengths?.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <ThumbsUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-emerald-400">Top Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {summary.top_strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                      <span className="text-emerald-400 mt-0.5">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Areas to Improve */}
            {summary.areas_to_improve?.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-semibold text-amber-400">Areas to Improve</h3>
                </div>
                <ul className="space-y-2">
                  {summary.areas_to_improve.map((a, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                      <span className="text-amber-400 mt-0.5">!</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Topics */}
            {summary.recommended_topics?.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-indigo-400">Recommended Topics to Study</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {summary.recommended_topics.map((t, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Score Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Score Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {scores.map((s) => (
            <div key={s.label} className="glass-card p-5 text-center">
              <s.icon className="w-6 h-6 mx-auto mb-2" style={{ color: scoreColor(s.score) }} />
              <div className="text-2xl font-bold" style={{ color: scoreColor(s.score) }}>
                {Math.round(s.score)}%
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Question-by-Question */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Question Review</h2>
        <div className="space-y-3">
          {i.questions?.map((q, idx) => (
            <div key={q.id} className="glass-card overflow-hidden">
              <button
                onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ background: q.answer ? scoreColor(q.answer.overall_score) : 'var(--border)' }}
                  >
                    {idx + 1}
                  </div>
                  <p className="text-sm font-medium line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                    {q.question_text}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {q.answer && (
                    <span className="text-sm font-bold" style={{ color: scoreColor(q.answer.overall_score) }}>
                      {Math.round(q.answer.overall_score)}%
                    </span>
                  )}
                  {expandedQ === q.id ? (
                    <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  ) : (
                    <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  )}
                </div>
              </button>

              {expandedQ === q.id && q.answer && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="border-t px-5 pb-5 pt-4 space-y-4"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div>
                    <p className="text-xs font-semibold mb-1 text-indigo-400">Your Answer</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{q.answer.answer_text}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1 text-cyan-400">AI Feedback</p>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{q.answer.feedback}</p>
                  </div>
                  {q.answer.strengths?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-1 text-emerald-400">Strengths</p>
                      <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        {q.answer.strengths.map((s, j) => <li key={j}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                  {q.answer.improvements?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-1 text-amber-400">Areas to Improve</p>
                      <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        {q.answer.improvements.map((s, j) => <li key={j}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex gap-4 pb-8">
        <Link
          to="/interviews/setup"
          className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-white gradient-primary
            text-center transition-all hover:scale-[1.02]"
        >
          Start New Interview
        </Link>
        <Link
          to="/dashboard"
          className="flex-1 py-3.5 rounded-xl text-sm font-semibold text-center glass-card
            transition-all hover:scale-[1.02]"
          style={{ color: 'var(--text-primary)' }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
