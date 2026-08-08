import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ShieldCheck, Target, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const UniqueSellingProposition = () => {
  const containerRef = useRef(null);
  const elementsRef = useRef([]);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(elementsRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative z-10 w-full py-32 bg-cyan-900/5 dark:bg-cyan-900/20 border-y border-cyan-500/20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        
        <h2 
          ref={el => elementsRef.current[0] = el}
          className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight" 
          style={{ color: 'var(--text-primary)' }}
        >
          The Only Platform That <br/>
          <span className="gradient-text">Actually Listens.</span>
        </h2>
        
        <p 
          ref={el => elementsRef.current[1] = el}
          className="text-xl md:text-2xl leading-relaxed mb-12" 
          style={{ color: 'var(--text-secondary)' }}
        >
          Unlike static coding challenge sites, SmartPrep engages you in dynamic, real-time voice conversations. It reads your resume, understands your background, and challenges you exactly where you need it most.
        </p>
        
        <div 
          ref={el => elementsRef.current[2] = el}
          className="flex flex-wrap justify-center gap-6"
        >
          <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 font-bold">
            <Zap className="w-5 h-5" />
            Real-Time Voice AI
          </div>
          <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 font-bold">
            <Target className="w-5 h-5" />
            Resume-Aware Context
          </div>
          <div className="flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
            <ShieldCheck className="w-5 h-5" />
            FAANG-Caliber Rubrics
          </div>
        </div>

      </div>
    </section>
  );
};

export default UniqueSellingProposition;
