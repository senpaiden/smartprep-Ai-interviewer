import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Brain, Play, FileText, Target, Bot, TrendingUp,
  Calendar, Plus
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';
import type { InterviewStats, Interview } from '@/types';

import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // Cached fetch for Dashboard stats
  const { data: stats } = useQuery<InterviewStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/users/dashboard/');
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Cached fetch for In-Progress Interviews
  const { data: upcomingInterviews = [] } = useQuery<Interview[]>({
    queryKey: ['upcoming-interviews'],
    queryFn: async () => {
      const res = await api.get('/interviews/me/?status=in_progress');
      return res.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const weekData = stats?.progress_over_time || [
    { day: "Mon", score: 65 },
    { day: "Tue", score: 72 },
    { day: "Wed", score: 68 },
    { day: "Thu", score: 80 },
    { day: "Fri", score: 85 },
    { day: "Sat", score: 88 },
    { day: "Sun", score: 90 },
  ];

  const skillData = [
    { subject: "Technical", A: stats?.scores?.technical || 82 },
    { subject: "Communication", A: stats?.scores?.communication || 78 },
    { subject: "Confidence", A: stats?.scores?.confidence || 85 },
    { subject: "Problem Solving", A: stats?.scores?.problem_solving || 80 },
    { subject: "Grammar", A: stats?.scores?.grammar || 88 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Welcome banner */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 shadow-xl shadow-indigo-500/10">
        <div className="absolute right-0 top-0 w-64 h-full opacity-10 flex items-center justify-center pointer-events-none">
          <Brain size={160} className="absolute -right-8 -top-4" />
        </div>
        <p className="text-indigo-200 text-xs font-semibold tracking-wide uppercase mb-1">{greeting()}</p>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Welcome back, {user?.first_name || user?.username || 'User'}! 👋</h2>
        <p className="text-indigo-100 text-sm mb-5 max-w-lg">You've completed {stats?.interviews_completed || 0} interviews. Keep the momentum going to land your dream job!</p>
        <div className="flex gap-3 flex-wrap">
          <Btn className="bg-white !text-indigo-600 hover:!bg-indigo-50 shadow-none border-0 font-semibold" onClick={() => navigate("/interviews/setup")}>
            <Play size={16} />Start Interview
          </Btn>
          <Btn className="bg-white/20 hover:bg-white/30 text-white shadow-none border-0 font-semibold" onClick={() => navigate("/resume")}>
            <FileText size={16} />Analyze Resume
          </Btn>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Resume Score" value={stats?.resume_score || "84/100"} change="Latest" icon={<FileText size={20} />} color="blue" />
        <StatCard label="ATS Score" value={stats?.ats_score || "85%"} change="Latest" icon={<Target size={20} />} color="purple" />
        <StatCard label="Interviews Done" value={`${stats?.interviews_completed || 0}`} change="Total" icon={<Bot size={20} />} color="green" />
        <StatCard label="Overall Rating" value={stats?.overall_rating || "8.2/10.0"} change="Average" icon={<TrendingUp size={20} />} color="orange" />
      </motion.div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="lg:col-span-2">
          <Card className="p-6 h-full border-border bg-card/60 backdrop-blur-sm">
            <h3 className="font-bold text-foreground mb-4 text-base">Weekly Performance</h3>
            <div className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weekData}>
                  <defs>
                    <linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
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
            </div>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
          <Card className="p-6 h-full border-border bg-card/60 backdrop-blur-sm">
            <h3 className="font-bold text-foreground mb-4 text-base">Skill Radar</h3>
            <div className="w-full h-56 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="rgba(99,102,241,0.2)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#8080a8", fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Interviews Card (Full Width) */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
        <Card className="p-6 h-full border-border bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground text-base">Upcoming Interviews</h3>
            <Btn variant="ghost" size="sm" onClick={() => navigate("/interviews/setup")} className="text-xs">
              <Plus size={14} className="mr-1" />Schedule
            </Btn>
          </div>
          <div className="space-y-3">
            {upcomingInterviews.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border rounded-xl bg-muted/20">
                <p className="text-sm text-muted-foreground">No in-progress interviews. Start one now!</p>
              </div>
            ) : (
              upcomingInterviews.slice(0, 5).map((interview) => (
                <div key={interview.id} className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl hover:bg-muted/70 cursor-pointer transition-colors border border-border" onClick={() => navigate(`/interviews/${interview.id}`)}>
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
    </div>
  );
}
