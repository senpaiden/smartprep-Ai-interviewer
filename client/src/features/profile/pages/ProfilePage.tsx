import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, BookOpen, Briefcase, Code2, Link as LinkIcon, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    profile: {
      phone: '',
      bio: '',
      skills: [] as string[],
      social_links: {} as Record<string, string>,
    },
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        profile: {
          phone: user.profile?.phone || '',
          bio: user.profile?.bio || '',
          skills: user.profile?.skills || [],
          social_links: user.profile?.social_links || {},
        },
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.patch('/users/me/', form);
      setUser(res.data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !form.profile.skills.includes(newSkill.trim())) {
      setForm(prev => ({
        ...prev,
        profile: { ...prev.profile, skills: [...prev.profile.skills, newSkill.trim()] },
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setForm(prev => ({
      ...prev,
      profile: { ...prev.profile, skills: prev.profile.skills.filter(s => s !== skill) },
    }));
  };

  const completion = user?.profile?.profile_completion || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your personal information and skills</p>
      </motion.div>

      {/* Profile Completion */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Profile Completion</span>
          <span className="text-sm font-bold gradient-text">{completion}%</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completion}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full gradient-primary"
          />
        </div>
      </motion.div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar & Basic Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 space-y-5">
          <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <User className="w-5 h-5 text-indigo-400" /> Basic Information
          </h3>

          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {(form.first_name[0] || '') + (form.last_name[0] || '')}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {user?.email}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>First Name</label>
              <input
                type="text" value={form.first_name}
                onChange={(e) => setForm(prev => ({ ...prev, first_name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Last Name</label>
              <input
                type="text" value={form.last_name}
                onChange={(e) => setForm(prev => ({ ...prev, last_name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              <Phone className="w-4 h-4 inline mr-1" /> Phone
            </label>
            <input
              type="tel" value={form.profile.phone}
              onChange={(e) => setForm(prev => ({ ...prev, profile: { ...prev.profile, phone: e.target.value } }))}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Bio</label>
            <textarea
              value={form.profile.bio}
              onChange={(e) => setForm(prev => ({ ...prev, profile: { ...prev.profile, bio: e.target.value } }))}
              placeholder="Tell us about yourself..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--text-primary)' }}>
            <Code2 className="w-5 h-5 text-cyan-400" /> Skills
          </h3>

          <div className="flex gap-2 mb-4">
            <input
              type="text" value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add a skill..."
              className="flex-1 px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
            <button
              type="button" onClick={addSkill}
              className="px-4 py-3 rounded-xl text-sm font-medium gradient-primary text-white hover:scale-105 transition-transform"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {form.profile.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer
                  transition-all hover:scale-105"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                onClick={() => removeSkill(skill)}
              >
                {skill}
                <span className="text-xs opacity-50">×</span>
              </span>
            ))}
            {form.profile.skills.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No skills added yet</p>
            )}
          </div>
        </motion.div>

        {/* Save */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <button
            type="submit" disabled={loading}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white gradient-primary
              transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
