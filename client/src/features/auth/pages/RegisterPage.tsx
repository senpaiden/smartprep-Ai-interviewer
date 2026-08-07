import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function RegisterPage() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', username: '',
    password: '', password_confirm: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);

    try {
      const res = await api.post('/auth/register/', form);
      login(res.data.user, res.data.tokens);
      toast.success('Account created! Welcome to SmartPrep.');
      navigate('/dashboard');
    } catch (err: any) {
      const errors = err.response?.data;
      if (errors) {
        const firstError = Object.values(errors).flat()[0];
        toast.error(String(firstError));
      } else {
        toast.error('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const getStrength = () => {
    const p = form.password;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength = getStrength();
  const strengthColors = ['#ef4444', '#f59e0b', '#22d3ee', '#10b981'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <div className="mesh-gradient" />

      {/* Left decorative */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center px-12"
        >
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Start Your Journey with <span className="gradient-text">SmartPrep</span>
          </h2>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            Create your account and begin your path to interview success.
          </p>
        </motion.div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">SmartPrep</span>
          </div>

          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Create Account</h1>
          <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>Fill in your details to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>First Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                  <input
                    type="text" value={form.first_name}
                    onChange={(e) => update('first_name', e.target.value)}
                    placeholder="John" required
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                    style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Last Name</label>
                <input
                  type="text" value={form.last_name}
                  onChange={(e) => update('last_name', e.target.value)}
                  placeholder="Doe" required
                  className="w-full px-4 py-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                  style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Username</label>
              <input
                type="text" value={form.username}
                onChange={(e) => update('username', e.target.value)}
                placeholder="johndoe" required
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="email" value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="you@example.com" required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                  style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="••••••••" required
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                  style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  {showPassword ? <EyeOff className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all" style={{ background: i < strength ? strengthColors[strength - 1] : 'var(--border)' }} />
                    ))}
                  </div>
                  <p className="text-xs mt-1" style={{ color: strength > 0 ? strengthColors[strength - 1] : 'var(--text-tertiary)' }}>
                    {strength > 0 ? strengthLabels[strength - 1] : 'Enter a password'}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  type="password" value={form.password_confirm}
                  onChange={(e) => update('password_confirm', e.target.value)}
                  placeholder="••••••••" required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                  style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white gradient-primary
                transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/25
                disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-8" style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
