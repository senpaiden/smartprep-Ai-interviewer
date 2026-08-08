import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain, Play, FileText, Target, Bot, TrendingUp,
  Calendar, Plus, Award
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import type { InterviewStats, Interview, Certificate } from '@/types';

import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState<InterviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [recentCertificates, setRecentCertificates] = useState<Certificate[]>([]);

  useEffect(() => {
    api.get('/users/dashboard/')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch user data
    api.get('/users/me/')
      .then((res) => useAuthStore.getState().setUser(res.data))
      .catch(() => {});

    // Fetch upcoming in-progress interviews
    api.get('/interviews/me/?status=in_progress')
      .then((res) => setUpcomingInterviews(res.data || []))
      .catch(() => {});

    // Fetch recent certificates
    api.get('/interviews/certificates/')
      .then((res) => setRecentCertificates((res.data || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const weekData = stats?.progress_over_time || [];
  const skillData = [
    { subject: "Technical", A: stats?.scores?.technical || 0 },
    { subject: "Communication", A: stats?.scores?.communication || 0 },
    { subject: "Confidence", A: stats?.scores?.confidence || 0 },
    { subject: "Problem Solving", A: stats?.scores?.problem_solving || 0 },
    { subject: "Grammar", A: stats?.scores?.grammar || 0 },
    { subject: "English Lit", A: 0 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10 flex items-center justify-center pointer-events-none">
          <Brain size={160} className="absolute -right-8 -top-4" />
        </div>
        <p className="text-indigo-200 text-sm mb-1">{greeting()}</p>
        <h2 className="text-2xl font-extrabold text-white mb-2">Welcome back, {user?.first_name || user?.username || 'User'}! 👋</h2>
        <p className="text-indigo-100 text-sm mb-5 max-w-lg">You've completed {stats?.interviews_completed || 0} interviews. Keep the momentum going to land your dream job!</p>
        <div className="flex gap-3 flex-wrap">
          <Btn className="bg-white !text-indigo-600 hover:!bg-indigo-50 shadow-none border-0" onClick={() => navigate("/interviews/setup")}>
            <Play size={16} />Start Interview
          </Btn>
          <Btn className="bg-white/20 hover:bg-white/30 text-white shadow-none border-0" onClick={() => navigate("/resume")}>
            <FileText size={16} />Analyze Resume
          </Btn>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Resume Score" value={stats?.resume_score || "0/100"} change="Latest" icon={<FileText size={20} />} color="blue" />
        <StatCard label="ATS Score" value={stats?.ats_score || "0%"} change="Latest" icon={<Target size={20} />} color="purple" />
        <StatCard label="Interviews Done" value={`${stats?.interviews_completed || 0}`} change="Total" icon={<Bot size={20} />} color="green" />
        <StatCard label="Overall Rating" value={`${stats?.overall_rating || 0}`} change="Average" icon={<TrendingUp size={20} />} color="orange" />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="lg:col-span-2">
          <Card className="p-6 h-full">
            <h3 className="font-bold text-foreground mb-4">Weekly Performance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,168,0.1)" />
                <XAxis dataKey="day" tick={{ fill: "#8080a8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8080a8", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" fill="url(#sGrad)" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
          <Card className="p-6 h-full">
            <h3 className="font-bold text-foreground mb-4">Skill Radar</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={skillData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <PolarGrid stroke="rgba(99,102,241,0.15)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#8080a8", fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Upcoming Interviews</h3>
              <Btn variant="ghost" size="sm" onClick={() => navigate("/interviews/setup")}><Plus size={14} />Schedule</Btn>
            </div>
            <div className="space-y-3">
              {upcomingInterviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No in-progress interviews. Start one now!</p>
              ) : (
                upcomingInterviews.slice(0, 3).map((interview) => (
                  <div key={interview.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl hover:bg-muted/60 cursor-pointer transition-colors" onClick={() => navigate(`/interviews/${interview.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center"><Calendar size={16} className="text-indigo-500 dark:text-indigo-400" /></div>
                      <div><p className="font-semibold text-foreground text-sm">{interview.role || interview.interview_type} Interview</p><p className="text-xs text-muted-foreground">{interview.difficulty} difficulty</p></div>
                    </div>
                    <Badge color="blue">{interview.questions_answered || 0}/{interview.total_questions}</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <Card className="p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Recent Certificates</h3>
              <Btn variant="ghost" size="sm" onClick={() => navigate("/interviews")}><Award size={14} className="mr-1" /> View all</Btn>
            </div>
            <div className="space-y-3">
              {recentCertificates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No certificates yet. Score 70%+ to earn one!</p>
              ) : (
                recentCertificates.map((cert) => (
                  <div key={cert.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl cursor-pointer hover:bg-muted/60 transition-colors" onClick={() => navigate("/certificates")}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center"><Award size={16} className="text-amber-500 dark:text-amber-400" /></div>
                      <div><p className="font-semibold text-foreground text-sm">{cert.unique_id}</p><p className="text-xs text-muted-foreground">{new Date(cert.issue_date).toLocaleDateString()}</p></div>
                    </div>
                    <Badge color="green">{Math.round(cert.overall_score)}%</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
