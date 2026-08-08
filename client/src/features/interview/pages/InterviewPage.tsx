import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Clock, StopCircle, Brain, User, ChevronRight } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import type { CurrentQuestion, AnswerEvaluation } from '@/types';

interface ChatMessage {
  role: 'ai' | 'user';
  content: string;
  evaluation?: AnswerEvaluation;
}

export default function InterviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  // Timer — countdown from duration
  const [durationSeconds] = useState(() => {
    const dur = parseInt(new URLSearchParams(window.location.search).get('duration') || '0');
    return dur > 0 ? dur * 60 : 0;
  });
  const [timer, setTimer] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch interview and initial question
  useEffect(() => {
    api.get(`/interviews/${id}/`).then((res) => {
      const interview = res.data;
      if (interview.status === 'completed') {
        navigate(`/interviews/${id}/results`);
        return;
      }

      // Set initial timer based on interview duration
      if (interview.duration_minutes && !durationSeconds) {
        setTimer(interview.duration_minutes * 60);
      }

      // Reconstruct chat from existing Q&As
      const msgs: ChatMessage[] = [];
      for (const q of interview.questions || []) {
        msgs.push({ role: 'ai', content: q.question_text });
        if (q.answer) {
          msgs.push({ role: 'user', content: q.answer.answer_text, evaluation: q.answer });
        }
      }
      setMessages(msgs);

      // Find last unanswered question
      const unanswered = interview.questions?.find((q: any) => !q.answer);
      if (unanswered) {
        setCurrentQuestion({
          id: unanswered.id,
          text: unanswered.question_text,
          number: unanswered.order,
          total: interview.total_questions,
        });
      }
    }).catch(() => toast.error('Failed to load interview'));
  }, [id, navigate]);

  // Timer — count up (or down if duration set)
  useEffect(() => {
    if (isComplete || timeUp) return;
    const interval = setInterval(() => {
      if (durationSeconds > 0) {
        setTimer(t => {
          if (t <= 1) {
            setTimeUp(true);
            clearInterval(interval);
            return 0;
          }
          return t - 1;
        });
      } else {
        setTimer(t => t + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isComplete, timeUp, durationSeconds]);

  // Auto-end when time is up
  useEffect(() => {
    if (timeUp && !isComplete) {
      toast.warning("Time's up! Ending interview...");
      handleEnd();
    }
  }, [timeUp, isComplete]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!answer.trim() || submitting) return;

    const userAnswer = answer.trim();
    setAnswer('');
    setMessages(prev => [...prev, { role: 'user', content: userAnswer }]);
    setSubmitting(true);

    // Add typing indicator
    setMessages(prev => [...prev, { role: 'ai', content: '...typing' }]);

    try {
      const res = await api.post(`/interviews/${id}/answer/`, { answer_text: userAnswer });

      // Remove typing indicator and add evaluation
      setMessages(prev => {
        const updated = prev.filter(m => m.content !== '...typing');
        // Add evaluation to last user message
        const lastUserIdx = updated.length - 1;
        if (updated[lastUserIdx]?.role === 'user') {
          updated[lastUserIdx].evaluation = res.data.evaluation;
        }
        return updated;
      });

      if (res.data.is_complete) {
        setIsComplete(true);
        setCurrentQuestion(null);
        toast.success('Interview completed!');
        setTimeout(() => navigate(`/interviews/${id}/results`), 2000);
      } else {
        // Add next question
        setCurrentQuestion(res.data.current_question);
        setMessages(prev => [...prev, { role: 'ai', content: res.data.current_question.text }]);
      }
    } catch {
      setMessages(prev => prev.filter(m => m.content !== '...typing'));
      toast.error('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnd = async () => {
    try {
      await api.post(`/interviews/${id}/end/`);
      navigate(`/interviews/${id}/results`);
    } catch {
      toast.error('Failed to end interview');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>AI Interview</h1>
            {currentQuestion && (
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                Question {currentQuestion.number} of {currentQuestion.total}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass-card">
            <Clock className={`w-4 h-4 ${timeUp ? 'text-red-400' : 'text-indigo-400'}`} />
            <span className={`text-sm font-mono font-semibold ${timeUp ? 'text-red-400' : ''}`} style={{ color: timeUp ? undefined : 'var(--text-primary)' }}>
              {formatTime(timer)}
              {durationSeconds > 0 && <span className="text-xs ml-1 opacity-60">remaining</span>}
            </span>
          </div>

          {/* Progress */}
          {currentQuestion && (
            <div className="hidden md:flex items-center gap-2">
              {Array.from({ length: currentQuestion.total }, (_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full transition-all"
                  style={{
                    background: i < currentQuestion.number - 1
                      ? '#10b981'
                      : i === currentQuestion.number - 1
                        ? '#6366f1'
                        : 'var(--border)',
                  }}
                />
              ))}
            </div>
          )}

          <button
            onClick={handleEnd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            <StopCircle className="w-4 h-4" /> End
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl glass-card p-6 space-y-4 mb-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'ai' ? 'gradient-primary' : 'bg-emerald-500'
              }`}>
                {msg.role === 'ai' ? <Brain className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
              </div>

              <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                {msg.content === '...typing' ? (
                  <div className="flex gap-1 p-4 rounded-2xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                    {[0, 1, 2].map(j => (
                      <div key={j} className="w-2 h-2 rounded-full bg-indigo-400 typing-dot"
                        style={{ animation: 'typing-dot 1.4s infinite' }} />
                    ))}
                  </div>
                ) : (
                  <div
                    className="p-4 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: msg.role === 'ai' ? 'var(--bg-glass)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      border: msg.role === 'ai' ? '1px solid var(--border)' : 'none',
                      color: msg.role === 'ai' ? 'var(--text-primary)' : '#fff',
                    }}
                  >
                    {msg.content}
                  </div>
                )}

                {/* Quick evaluation feedback */}
                {msg.evaluation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 p-4 rounded-xl text-xs space-y-2"
                    style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}
                  >
                    {/* Score */}
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl font-bold ${
                        (msg.evaluation.score || 0) >= 7 ? 'text-emerald-400' :
                        (msg.evaluation.score || 0) >= 5 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {(msg.evaluation.score || 0).toFixed(1)}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>/ 10</div>
                    </div>

                    {/* Reason */}
                    {msg.evaluation.feedback && (
                      <div>
                        <p className="font-semibold mb-0.5" style={{ color: 'var(--text-secondary)' }}>Reason</p>
                        <p style={{ color: 'var(--text-primary)' }}>{msg.evaluation.feedback}</p>
                      </div>
                    )}

                    {/* Recommendations */}
                    {msg.evaluation.improvements && msg.evaluation.improvements.length > 0 && (
                      <div>
                        <p className="font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Learn & Improve</p>
                        <ul className="space-y-1">
                          {msg.evaluation.improvements.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2" style={{ color: 'var(--text-primary)' }}>
                              <span className="text-indigo-400 mt-0.5">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!isComplete && (
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
              rows={2}
              disabled={submitting}
              className="w-full px-5 py-4 rounded-2xl text-sm outline-none resize-none
                focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || submitting}
            className="px-5 rounded-2xl gradient-primary text-white
              transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      )}
    </div>
  );
}
