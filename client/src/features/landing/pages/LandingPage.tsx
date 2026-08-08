import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ProblemStatement from '../components/ProblemStatement';
import ProposedSolution from '../components/ProposedSolution';
import UniqueSellingProposition from '../components/UniqueSellingProposition';
import ScrollExperience from '../components/ScrollExperience';
import FeatureGrid from '../components/FeatureGrid';
import InteractiveRoadmap from '../components/InteractiveRoadmap';
import DemoBanner from '../components/DemoBanner';
import Footer from '../components/Footer';

// FAQ data
const faqs = [
  { q: "Is the platform really free?", a: "Yes! We offer a generous free tier that includes basic mock interviews and resume analysis." },
  { q: "What roles do you support?", a: "We support Software Engineering, Data Science, Product Management, and more." },
  { q: "Can I practice for specific companies?", a: "Absolutely. We have specialized interview modules for FAANG and top tech companies." },
  { q: "Do I need to download anything?", a: "No, everything runs seamlessly in your browser." }
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen overflow-hidden" style={{ background: 'var(--bg)' }}>
      <Helmet>
        <title>SmartPrep | Master Your AI Interviews</title>
        <meta name="description" content="AI-powered interview preparation platform. Practice coding, behavioral, and technical rounds with real-time feedback." />
      </Helmet>
      
      <div className="mesh-gradient absolute inset-0 opacity-40 mix-blend-screen pointer-events-none" />

      <Navbar />
      
      {/* 1. Hero Section */}
      <Hero />
      
      {/* 2. The Problem */}
      <ProblemStatement />
      
      {/* 3. The Proposed Solution */}
      <ProposedSolution />
      
      {/* 4. Clear USP */}
      <UniqueSellingProposition />

      {/* 5. Features Grid */}
      <FeatureGrid />
      
      {/* 6. Process Scroll */}
      <ScrollExperience />
      
      {/* 7. Roadmap */}
      <InteractiveRoadmap />
      
      {/* 8. Demo CTA Banner */}
      <DemoBanner />

      {/* 9. FAQ Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6" style={{ color: 'var(--text-primary)' }}>
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden border border-white/10 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-md hover:border-cyan-500/30 transition-colors">
              <button 
                className="w-full px-8 py-6 text-left flex justify-between items-center"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} style={{ color: 'var(--text-secondary)' }} />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-8 pb-6 text-base"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 mb-20">
        <div className="p-16 text-center rounded-[3rem] relative overflow-hidden shadow-2xl border border-white/20" style={{ background: 'var(--bg-glass)' }}>
          <div className="absolute inset-0 gradient-primary opacity-10" />
          
          <h2 className="text-4xl md:text-6xl font-black mb-6 relative z-10" style={{ color: 'var(--text-primary)' }}>
            Ready to <span className="gradient-text">Transform</span> Your Career?
          </h2>
          
          <p className="text-xl mb-12 relative z-10 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Join thousands of candidates who aced their interviews and landed their dream jobs.
          </p>
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              to="/register"
              className="flex items-center gap-3 px-10 py-5 rounded-2xl text-xl font-bold text-white gradient-primary
                transition-all hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/40 pulse-glow"
            >
              Start Practicing Free <ArrowRight className="w-6 h-6" />
            </Link>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8 mt-10 relative z-10">
            {['No credit card required', 'Free forever plan', 'Cancel anytime'].map((item) => (
              <div key={item} className="flex items-center gap-2 font-medium" style={{ color: 'var(--text-secondary)' }}>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Footer */}
      <Footer />
    </div>
  );
}
