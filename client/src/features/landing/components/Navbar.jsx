import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 backdrop-blur-xl border-b bg-white/60 dark:bg-black/60" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold gradient-text">SmartPrep</span>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={toggleTheme} className="p-2 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ border: '1px solid var(--border)' }}>
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-500" />}
        </button>
        <Link
          to="/login"
          className="hidden sm:block px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
          style={{ color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white gradient-primary transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
