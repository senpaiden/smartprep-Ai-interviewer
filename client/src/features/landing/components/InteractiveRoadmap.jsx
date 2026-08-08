import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Target, Zap, TrendingUp, Award } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const roadmapSteps = [
  { icon: Target, title: 'Initial Assessment', color: 'from-slate-500 to-cyan-500' },
  { icon: Zap, title: 'Personalized Practice', color: 'from-cyan-500 to-teal-500' },
  { icon: TrendingUp, title: 'Progress Tracking', color: 'from-purple-500 to-pink-500' },
  { icon: Award, title: 'Interview Readiness', color: 'from-pink-500 to-rose-500' }
];

const InteractiveRoadmap = () => {
  const containerRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    let ctx = gsap.context(() => {
      nodesRef.current.forEach((node, i) => {
        gsap.fromTo(node, 
          { opacity: 0, scale: 0.5, y: 50 },
          { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: node,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative z-10 max-w-5xl mx-auto px-6 py-32">
      <div className="text-center mb-20">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6" style={{ color: 'var(--text-primary)' }}>
          Your Path to <span className="gradient-text">Mastery</span>
        </h2>
      </div>

      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-500/20 via-teal-500/20 to-transparent -translate-x-1/2" />
        
        {roadmapSteps.map((step, i) => (
          <div 
            key={i} 
            ref={el => nodesRef.current[i] = el}
            className={`relative flex items-center justify-between mb-16 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}
          >
            <div className="w-5/12" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black dark:bg-white border-4 border-cyan-500 z-10 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
              <step.icon className="w-6 h-6 text-cyan-500" />
            </div>
            <div className={`w-5/12 glass-card p-8 rounded-3xl border border-white/10 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-xl hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-shadow ${i % 2 === 0 ? 'text-left' : 'text-right'}`}>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{step.title}</h3>
              <div className={`h-1 w-20 rounded-full bg-gradient-to-r ${step.color} ${i % 2 !== 0 && 'ml-auto'}`} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InteractiveRoadmap;
