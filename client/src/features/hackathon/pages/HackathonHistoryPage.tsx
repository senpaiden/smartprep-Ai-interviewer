import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ArrowRight, User, Briefcase, Calendar, Bot, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/api';

interface HackathonSession {
  session_id: string;
  candidate_name: string;
  candidate_role: string;
  questions_asked: number;
  is_done: boolean;
  created_at: string;
}

interface SessionDetails {
  session_id: string;
  candidate_data: any;
  conversation_history: { role: string; content: string }[];
  questions_asked: number;
  is_done: boolean;
  created_at: string;
}

export default function HackathonHistoryPage() {
  const [sessions, setSessions] = useState<HackathonSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<SessionDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/interview/sessions/');
      setSessions(res.data.sessions || []);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSessionDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      const res = await api.get(`/interview/sessions/${id}/`);
      setSelectedSession(res.data);
    } catch {
      // silently fail
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => setSelectedSession(null);

  return (
    <div className="min-h-screen p-8 font-sans" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Interview History
              </h1>
              <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Review past hackathon AI interviews.</p>
            </div>
          </div>
          <Link
            to="/hackathon"
            className="px-6 py-2.5 rounded-xl transition-colors font-medium flex items-center gap-2 glass-card hover:opacity-80"
          >
            New Interview <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* List */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <th className="px-6 py-4 font-medium">Candidate</th>
                  <th className="px-6 py-4 font-medium">Target Role</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm" style={{ borderColor: 'var(--border)' }}>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center" style={{ color: 'var(--text-secondary)' }}>
                      Loading sessions...
                    </td>
                  </tr>
                ) : sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-8 h-8 opacity-50" />
                        <p>No interview sessions found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr key={session.session_id} className="transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full glass-card flex items-center justify-center">
                          <User className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                        </div>
                        {session.candidate_name}
                      </td>
                      <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-indigo-400" />
                          {session.candidate_role}
                        </div>
                      </td>
                      <td className="px-6 py-4" style={{ color: 'var(--text-secondary)' }}>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(session.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {session.is_done ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            In Progress ({session.questions_asked}/8)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => fetchSessionDetails(session.session_id)}
                          className="px-4 py-2 rounded-lg transition-colors font-medium text-sm text-indigo-400 hover:bg-indigo-500/10"
                        >
                          {loadingDetails ? 'Loading...' : 'View Details'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal for Details */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[85vh] glass-card rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-glass)' }}>
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <History className="w-5 h-5 text-indigo-400" />
                    Interview Transcript
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {selectedSession.candidate_data?.member?.name} - {selectedSession.candidate_data?.member?.jobRole}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ✕
                </button>
              </div>

              {/* Modal Body (Transcript) */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {selectedSession.conversation_history.length === 0 ? (
                  <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No conversation history available.</p>
                ) : (
                  selectedSession.conversation_history.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === 'user' ? 'gradient-primary' : 'glass-card'
                      }`}>
                        {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white'
                          : 'glass-card'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: msg.role === 'user' ? '#fff' : 'var(--text-primary)' }}>{msg.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
