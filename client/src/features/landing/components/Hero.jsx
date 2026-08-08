import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import ThreeHeroCanvas from './ThreeHeroCanvas';

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center pt-20 pb-32 px-6">
      <ThreeHeroCanvas />
      
      <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-10 shadow-xl backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/20">
            <Star className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>
              Next-Gen Interview Intelligence
            </span>
          </div>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] tracking-tight mb-8 drop-shadow-xl"
        >
          <span style={{ color: 'var(--text-primary)' }}>Master Your Next</span>
          <br />
          <span className="gradient-text">Interview with AI</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-2xl max-w-3xl mx-auto mb-12 font-medium drop-shadow-md" 
          style={{ color: 'var(--text-secondary)' }}
        >
          Experience immersive mock interviews with our cutting-edge AI engine. Solves coding challenges, analyzes behavior, and guarantees results.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link
            to="/register"
            className="group flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold text-white gradient-primary
              transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(99,102,241,0.5)]"
          >
            Start Your Journey 
            <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
