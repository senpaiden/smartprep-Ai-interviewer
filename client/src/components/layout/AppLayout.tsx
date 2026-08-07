import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, Sun, Moon, Brain, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import Sidebar from './Sidebar';
import api from '@/lib/api';
import { useEffect } from 'react';

function cn(...cls: (string | false | null | undefined)[]): string {
  return cls.filter(Boolean).join(" ");
}

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications/');
      setNotifications(Array.isArray(data) ? data : (data.results || []));
    } catch (e) {
      console.error(e);
      setNotifications([]);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read/`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all/');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  // Apply theme to document (optional, but good practice if you want true light mode later)
  if (typeof document !== 'undefined') {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentPage={location.pathname} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/80 backdrop-blur-md shrink-0">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  navigate(`/roadmap?topic=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
              className="bg-input-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm w-56 text-foreground placeholder:text-muted-foreground outline-none focus:border-indigo-500 transition-colors" 
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg hover:bg-accent/60 transition-colors">
              {theme === "dark" ? <Sun size={18} className="text-muted-foreground" /> : <Moon size={18} className="text-muted-foreground" />}
            </button>
            
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 rounded-lg hover:bg-accent/60 transition-colors relative">
                <Bell size={18} className="text-muted-foreground" />
                {(notifications || []).some(n => !n.is_read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-2xl shadow-xl shadow-black/10 z-50 p-4 max-h-96 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-foreground text-sm">Notifications</p>
                    {(notifications || []).length > 0 && (
                      <button onClick={markAllAsRead} className="text-xs text-indigo-500 hover:text-indigo-600">Mark all read</button>
                    )}
                  </div>
                  {(!notifications || notifications.length === 0) ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={cn("flex items-start gap-3 py-3 border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-accent/30 -mx-4 px-4", !n.is_read && "bg-accent/10")}
                      >
                        <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", !n.is_read ? "bg-indigo-500" : "bg-gray-300 dark:bg-gray-600")} />
                        <div>
                          <p className="text-sm text-foreground">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            
            <button onClick={() => navigate('/profile')} className="flex items-center gap-2 hover:bg-accent/60 rounded-xl px-2 py-1.5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-foreground leading-none">{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || 'User'}</p>
                <p className="text-xs text-muted-foreground">Pro plan</p>
              </div>
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
