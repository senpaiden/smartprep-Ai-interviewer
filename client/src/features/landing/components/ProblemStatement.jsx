import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AlertTriangle, Clock, Frown, MessageSquareX } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const problems = [
  { icon: Clock, title: "Ghosted After Months", desc: "You spend weeks preparing, clear the first round, and then... absolute silence from recruiters." },
  { icon: MessageSquareX, title: "No Actionable Feedback", desc: "Generic rejection emails leave you guessing what actually went wrong during the technical round." },
  { icon: Frown, title: "Unrealistic LeetCode Puzzles", desc: "Memorizing obscure algorithms that have nothing to do with day-to-day engineering tasks." }
];

const ProblemStatement = () => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Fade in the header text
      gsap.fromTo(textRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 1,
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 80%",
          }
        }
      );

      // Staggered reveal for problem cards
      gsap.fromTo(cardsRef.current,
        { opacity: 0, y: 50, scale: 0.9 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.2,
          ease: "power3.out",
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
    <section ref={containerRef} className="relative z-10 w-full py-32 bg-black/10 dark:bg-black/40 border-y" style={{ borderColor: 'var(--border)' }}>
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full max-h-96 bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div ref={textRef} className="text-center mb-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-red-500/20 bg-red-500/10 text-red-500 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            THE PROBLEM
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 text-slate-800 dark:text-slate-100 leading-tight">
            Technical Interviews are <span className="text-red-500">Broken</span>.
          </h2>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto text-slate-600 dark:text-slate-400">
            The current hiring process is anxiety-inducing, opaque, and optimized for failure, not potential.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, i) => (
            <div 
              key={i} 
              ref={el => cardsRef.current[i] = el}
              className="glass-card p-10 rounded-[2rem] border border-red-500/10 bg-white/40 dark:bg-black/60 backdrop-blur-xl flex flex-col items-center text-center hover:border-red-500/30 transition-colors"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                <problem.icon className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800 dark:text-slate-100">{problem.title}</h3>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {problem.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemStatement;
