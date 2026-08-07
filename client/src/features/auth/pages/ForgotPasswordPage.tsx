import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Sparkles, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password/', { email });
      setSent(true);
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
      <div className="mesh-gradient" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/login" className="flex items-center gap-2 text-sm font-medium mb-8 text-indigo-400 hover:text-indigo-300">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Check Your Email</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                If an account with that email exists, we've sent a password reset link.
              </p>
              <Link to="/login" className="text-sm font-semibold text-indigo-400 hover:text-indigo-300">
                Return to login
              </Link>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Forgot Password?</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                No worries, we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    <input
                      type="email" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com" required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                      style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <button
                  type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold text-white gradient-primary
                    transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
