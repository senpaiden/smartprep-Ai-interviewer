import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, ShieldCheck } from 'lucide-react';

const DemoBanner = () => {
  return (
    <section className="relative z-10 w-full py-24 overflow-hidden border-y bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="glass-card rounded-[3rem] p-12 overflow-hidden relative border border-white/20 shadow-2xl backdrop-blur-2xl bg-white/30 dark:bg-black/30 text-center">
          
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-teal-500/10 to-emerald-500/10" />
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white/80 dark:bg-black/80 flex items-center justify-center mb-8 shadow-xl cursor-pointer hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-cyan-500 ml-2" />
            </div>
            
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6" style={{ color: 'var(--text-primary)' }}>
              See <span className="gradient-text">SmartPrep</span> in Action
            </h2>
            <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: 'var(--text-secondary)' }}>
              Watch a 2-minute interactive demo of our AI interviewer conducting a real system design interview.
            </p>
            
            <Link
              to="/register"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl text-lg font-bold text-white gradient-primary hover:scale-105 transition-all shadow-xl shadow-cyan-500/30 pulse-glow"
            >
              Try it Yourself <ArrowRight className="w-6 h-6" />
            </Link>
            
            <div className="flex items-center gap-2 mt-8 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span>No credit card required for trial</span>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default DemoBanner;
