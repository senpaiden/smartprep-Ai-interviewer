import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, CheckCircle2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import api from '@/lib/api';

interface Message {
  role: 'user' | 'agent';
  content: string;
}

interface Feedback {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
}

export default function HackathonChatPage() {
  const [sessionId] = useState(() => uuidv4());
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [error, setError] = useState('');
  
  // Setup State
  const [hasSetup, setHasSetup] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidateIndex, setSelectedCandidateIndex] = useState<number>(-1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasSetup) {
      api.get('/interview/candidates/')
        .then(res => {
          const list = Array.isArray(res.data?.candidates) ? res.data.candidates : (Array.isArray(res.data) ? res.data : []);
          setCandidates(list);
        })
        .catch(() => {
          setCandidates([]);
          setError('Failed to load candidates');
        });
    }
  }, [hasSetup]);


  const startInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCandidateIndex < 0) return;
    
    const candidate = candidates[selectedCandidateIndex];
    
    setHasSetup(true);
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/interview', {
        sessionId,
        candidate: candidate
      });
      setMessages([{ role: 'agent', content: res.data.reply }]);
      if (res.data.done) {
        setIsDone(true);
        setFeedback(res.data.feedback);
      }
    } catch {
      setError('Failed to start interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isDone) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/interview', {
        sessionId,
        message: userMessage
      });

      setMessages((prev) => [...prev, { role: 'agent', content: res.data.reply }]);
      
      if (res.data.done) {
        setIsDone(true);
        setFeedback(res.data.feedback);
      }
    } catch {
      setError('Failed to send message.');
      setMessages((prev) => [...prev, { role: 'agent', content: "Error communicating with the server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-md glass-card p-8 rounded-2xl shadow-xl">
          <div className="flex items-center justify-center w-16 h-16 rounded-full gradient-primary mb-6 mx-auto">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--text-primary)' }}>Candidate Setup</h1>
          <p className="text-center mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>Select a candidate to start the AI interview session.</p>
          {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
          <form onSubmit={startInterview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Select Candidate Profile</label>
              <select
                value={selectedCandidateIndex}
                onChange={(e) => setSelectedCandidateIndex(Number(e.target.value))}
                required
                className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="-1" disabled>-- Choose a candidate --</option>
                {(candidates || []).map((c, i) => (
                  <option key={i} value={i}>
                    {c?.member?.name || c?.name || `Candidate ${i+1}`} - {c?.member?.jobRole || c?.jobRole || 'AI Cohort Student'}
                  </option>
                ))}

              </select>
            </div>
            <button
              type="submit"
              className="w-full gradient-primary text-white font-semibold py-3 rounded-xl mt-4 transition-colors flex items-center justify-center gap-2"
            >
              Start Interview
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header className="px-6 py-4 border-b backdrop-blur-md sticky top-0 z-10 flex items-center gap-3" style={{ borderColor: 'var(--border)', background: 'var(--bg-glass)' }}>
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            The AI Cohort Interview
          </h1>
          <p className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Agent Online
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-hidden">
        {/* Error banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm text-center" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}
        
        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pb-24 pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}>
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-indigo-600' : 'glass-card'
                }`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-indigo-100" /> : <Bot className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />}
                </div>

                <div className={`p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'glass-card rounded-tl-sm'
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap text-sm sm:text-base" style={{ color: msg.role === 'user' ? '#fff' : 'var(--text-primary)' }}>{msg.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading Indicator */}
          {isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 shrink-0 rounded-full glass-card flex items-center justify-center">
                <Bot className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div className="p-4 rounded-2xl glass-card rounded-tl-sm flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}

          {/* Feedback Card */}
          {isDone && feedback && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="mt-8 p-6 rounded-2xl glass-card border border-indigo-500/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Interview Complete</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-indigo-400 mb-2">Performance Summary</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feedback.summary}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                    <h3 className="font-semibold text-green-400 mb-2">Key Strengths</h3>
                    <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      {(feedback?.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  
                  <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                    <h3 className="font-semibold text-orange-400 mb-2">Areas for Growth</h3>
                    <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      {(feedback?.gaps || []).map((g, i) => <li key={i}>{g}</li>)}
                    </ul>
                  </div>
                </div>

                <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <h3 className="font-semibold text-indigo-400 mb-2">Next Steps</h3>
                  <ul className="list-disc list-inside text-sm space-y-1" style={{ color: 'var(--text-secondary)' }}>
                    {(feedback?.next || []).map((n, i) => <li key={i}>{n}</li>)}
                  </ul>
                </div>

              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Input Area (Sticky Bottom) */}
      <div className="fixed bottom-0 w-full pt-10 pb-6 px-4" style={{ background: 'linear-gradient(to top, var(--bg), transparent)' }}>
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || isDone}
              placeholder={isDone ? "Interview finished" : "Type your response..."}
              className="w-full rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading || isDone}
              className="absolute right-2 top-2 bottom-2 aspect-square bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 -ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
