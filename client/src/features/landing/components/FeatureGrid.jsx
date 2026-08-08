import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Code2, FileText, BarChart3, Shield, Zap } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Interviews', desc: 'Intelligent questions that adapt to your level with real-time feedback.' },
  { icon: Code2, title: 'Coding Challenges', desc: 'Practice with a built-in code editor supporting multiple languages.' },
  { icon: FileText, title: 'Resume Analyzer', desc: 'Get your ATS score, missing skills, and improvement suggestions.' },
  { icon: BarChart3, title: 'Performance Analytics', desc: 'Detailed score breakdowns with radar charts and progress tracking.' },
  { icon: Shield, title: 'Company-Specific Prep', desc: 'Interview sets tailored for Google, Microsoft, Amazon and more.' },
  { icon: Zap, title: 'AI Learning Roadmap', desc: 'Personalized study plans based on your weak areas.' },
];

const TiltCard = ({ children, className = "" }) => {
  const ref = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const rX = ((mouseY / height) - 0.5) * -20;
    const rY = ((mouseX / width) - 0.5) * 20;
    
    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className={className}
    >
      <div style={{ transform: "translateZ(30px)" }}>
        {children}
      </div>
    </motion.div>
  );
};

const FeatureGrid = () => {
  return (
    <section className="relative z-10 max-w-7xl mx-auto px-6 py-32">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6" style={{ color: 'var(--text-primary)' }}>
          Everything You Need to <span className="gradient-text">Succeed</span>
        </h2>
        <p className="text-xl max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          A comprehensive, AI-driven suite designed to prepare you for any scenario.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, i) => (
          <TiltCard key={feature.title}>
            <div className="glass-card p-8 h-full rounded-3xl border border-white/10 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-xl hover:border-cyan-500/30 transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-6">
                <feature.icon className="w-7 h-7 text-cyan-500" />
              </div>
              <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {feature.desc}
              </p>
            </div>
          </TiltCard>
        ))}
      </div>
    </section>
  );
};

export default FeatureGrid;
