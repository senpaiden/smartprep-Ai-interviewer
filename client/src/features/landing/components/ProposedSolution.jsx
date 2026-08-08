import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, BrainCircuit, HeartHandshake, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ProposedSolution = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const featureRefs = useRef([]);

  const features = [
    { icon: BrainCircuit, title: "Objective AI Evaluation", desc: "No human bias, no bad days. Just consistent, data-driven assessment of your actual skills." },
    { icon: HeartHandshake, title: "Empathetic Feedback", desc: "Get constructive, encouraging feedback immediately after your session ends." },
    { icon: Zap, title: "Infinite Adaptability", desc: "The AI adjusts to your pace in real-time, pushing you just enough without overwhelming you." }
  ];

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(textRef.current,
        { opacity: 0, scale: 0.9, y: 30 },
        {
          opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "expo.out",
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 75%",
          }
        }
      );

      gsap.fromTo(featureRefs.current,
        { opacity: 0, x: -50 },
        {
          opacity: 1, x: 0, duration: 0.8, stagger: 0.2, ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 60%",
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative z-10 w-full py-32 overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Narrative */}
        <div ref={textRef}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 font-bold text-sm">
            <Sparkles className="w-4 h-4" />
            THE SOLUTION
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-[1.1]" style={{ color: 'var(--text-primary)' }}>
            Enter <span className="gradient-text">SmartPrep AI</span>
          </h2>
          <p className="text-xl leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
            We rebuilt the interview experience from the ground up. SmartPrep acts as a tireless, empathetic, and hyper-intelligent engineering manager who wants you to succeed.
          </p>
          <div className="h-1 w-24 rounded-full gradient-primary opacity-50" />
        </div>

        {/* Right Side: Key Pillars */}
        <div className="flex flex-col gap-6">
          {features.map((feature, i) => (
            <div 
              key={i} 
              ref={el => featureRefs.current[i] = el}
              className="glass-card p-8 rounded-3xl flex items-start gap-6 border border-white/10 dark:border-white/5 bg-white/50 dark:bg-black/50 backdrop-blur-md hover:scale-[1.02] transition-transform"
            >
              <div className="shrink-0 w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{feature.title}</h3>
                <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};

export default ProposedSolution;
