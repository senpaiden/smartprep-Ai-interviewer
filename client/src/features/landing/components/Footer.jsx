import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative z-10 border-t py-12 px-6 bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">SmartPrep</span>
        </div>
        <div className="flex gap-8 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          <Link to="/about" className="hover:text-cyan-500 transition-colors">About</Link>
          <Link to="/privacy" className="hover:text-cyan-500 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-cyan-500 transition-colors">Terms of Service</Link>
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--text-tertiary)' }}>
          © {new Date().getFullYear()} SmartPrep. Built for the future of hiring.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
