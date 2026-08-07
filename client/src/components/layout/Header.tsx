import { useEffect, useState } from 'react';
import { Bell, Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useAuthStore } from '@/stores/authStore';
import api from '@/lib/api';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/notifications/unread-count/')
      .then((res) => setUnreadCount(res.data.unread_count))
      .catch(() => {});
  }, []);

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.email[0].toUpperCase()
    : '?';

  return (
    <header
      className="flex items-center justify-between h-16 px-4 md:px-6 border-b backdrop-blur-xl"
      style={{
        background: 'var(--bg-glass)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Left: hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl transition-colors hover:bg-white/5"
      >
        <Menu className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
      </button>

      <div className="hidden lg:block" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl transition-all duration-200 hover:scale-105"
          style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2.5 rounded-xl transition-all duration-200 hover:scale-105"
          style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white gradient-primary cursor-pointer"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="w-full h-full rounded-xl object-cover" />
          ) : (
            initials
          )}
        </div>
      </div>
    </header>
  );
}
