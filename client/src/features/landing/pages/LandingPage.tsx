import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Sparkles, Brain, Code2, FileText, BarChart3,
  Shield, Zap, Users, ArrowRight, Star, CheckCircle2,
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Interviews', desc: 'Intelligent questions that adapt to your level with real-time feedback.' },
  { icon: Code2, title: 'Coding Challenges', desc: 'Practice with a built-in code editor supporting multiple languages.' },
  { icon: FileText, title: 'Resume Analyzer', desc: 'Get your ATS score, missing skills, and improvement suggestions.' },
  { icon: BarChart3, title: 'Performance Analytics', desc: 'Detailed score breakdowns with radar charts and progress tracking.' },
  { icon: Shield, title: 'Company-Specific Prep', desc: 'Interview sets tailored for Google, Microsoft, Amazon and more.' },
  { icon: Zap, title: 'AI Learning Roadmap', desc: 'Personalized study plans based on your weak areas.' },
];

const stats = [
  { value: '50K+', label: 'Mock Interviews' },
  { value: '95%', label: 'Success Rate' },
  { value: '200+', label: 'Companies' },
  { value: '4.9★', label: 'User Rating' },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Helmet>
        <title>SmartPrep | Master Your AI Interviews</title>
        <meta name="description" content="AI-powered interview preparation platform. Practice coding, behavioral, and technical rounds with real-time feedback." />
      </Helmet>
      
      <div className="mesh-gradient" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">SmartPrep</span>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="p-2 rounded-xl" style={{ border: '1px solid var(--border)' }}>
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105"
            style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/25"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
            style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              #1 AI Interview Platform
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            <span style={{ color: 'var(--text-primary)' }}>Ace Your Next</span>
            <br />
            <span className="gradient-text">Interview with AI</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
            Practice with an AI interviewer that adapts to your level.
            Get detailed feedback, improve your skills, and land your dream job.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white gradient-primary
                transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/30 pulse-glow"
            >
              Start Practicing Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold glass-card
                transition-all hover:scale-105"
              style={{ color: 'var(--text-primary)' }}
            >
              I have an account
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card p-6 text-center">
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Everything You Need to <span className="gradient-text">Succeed</span>
          </h2>
          <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            A comprehensive platform designed to prepare you for any interview scenario.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-8 group cursor-default"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-5
                transition-transform group-hover:scale-110 group-hover:rotate-3">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 gradient-primary opacity-5" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10" style={{ color: 'var(--text-primary)' }}>
            Ready to <span className="gradient-text">Transform</span> Your Career?
          </h2>
          <p className="text-lg mb-8 relative z-10" style={{ color: 'var(--text-secondary)' }}>
            Join thousands of candidates who aced their interviews with SmartPrep.
          </p>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white gradient-primary
                transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/30"
            >
              Get Started — It's Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 relative z-10">
            {['No credit card required', 'Free forever plan', 'Cancel anytime'].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t px-6 py-8" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold gradient-text">SmartPrep</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            © 2025 SmartPrep. Built with AI for the future of hiring.
          </p>
        </div>
      </footer>
    </div>
  );
}
