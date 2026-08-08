import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, PlayCircle, BarChart3 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { icon: FileText, title: '1. Upload Resume', desc: 'We analyze your profile to tailor the interview precisely to your experience.' },
  { icon: PlayCircle, title: '2. Start Mock Interview', desc: 'Engage in a dynamic voice or text conversation with our AI.' },
  { icon: BarChart3, title: '3. Get Instant Feedback', desc: 'Receive actionable insights and a comprehensive score report immediately.' },
];

const ScrollExperience = () => {
  const sectionRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      // Horizontal scroll animation
      gsap.to(sectionRef.current, {
        xPercent: -100 * (steps.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: triggerRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (steps.length - 1),
          end: () => "+=" + triggerRef.current.offsetWidth
        }
      });
    }, triggerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={triggerRef} className="relative z-10 w-full bg-black/5 dark:bg-white/5 border-y" style={{ borderColor: 'var(--border)', overflow: 'hidden' }}>
      <div className="h-screen flex items-center">
        <div ref={sectionRef} className="flex w-[300vw] h-full">
          {steps.map((step, i) => (
            <div key={i} className="w-[100vw] h-full flex flex-col justify-center items-center px-6">
              <div className="glass-card p-12 max-w-2xl text-center rounded-[3rem] border border-white/10 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-xl">
                <div className="w-24 h-24 mx-auto rounded-3xl gradient-primary flex items-center justify-center mb-8 shadow-2xl shadow-cyan-500/40">
                  <step.icon className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl md:text-5xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>{step.title}</h2>
                <p className="text-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScrollExperience;
