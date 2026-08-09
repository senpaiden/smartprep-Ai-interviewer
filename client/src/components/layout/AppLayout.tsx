import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Bell, Sun, Moon, Menu, Brain, Home, Map, 
  Bot, Code2, FileText, BarChart3, Award, User, X, LogOut 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import Sidebar from './Sidebar';
import api from '@/lib/api';

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
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
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

  // Apply theme to document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Close mobile menus on route change
  useEffect(() => {
    setMobileMoreOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  const mobileNavTabs = [
    { path: '/dashboard', label: 'Home', icon: <Home size={20} /> },
    { path: '/roadmap', label: 'Roadmap', icon: <Map size={20} /> },
    { path: '/interviews/setup', label: 'Interview', icon: <Bot size={20} /> },
    { path: '/resume', label: 'Resume', icon: <FileText size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    setMobileMoreOpen(false);
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full shrink-0">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentPage={location.pathname} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Navbar Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-border bg-background/80 backdrop-blur-md shrink-0 gap-3 z-30">
          {/* Mobile Logo Brand / Search */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="md:hidden flex items-center gap-2 shrink-0 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Brain size={18} />
              </div>
              <span className="font-bold text-sm text-foreground hidden sm:inline">SmartPrep</span>
            </div>

            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                placeholder="Search topics..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    navigate(`/roadmap?topic=${encodeURIComponent(searchQuery.trim())}`);
                  }
                }}
                className="bg-input-background border border-border rounded-xl pl-9 pr-3 py-1.5 text-xs md:text-sm w-full text-foreground placeholder:text-muted-foreground outline-none focus:border-indigo-500 transition-colors" 
              />
            </div>
          </div>
          
          {/* Header Action Controls */}
          <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
              className="p-2 rounded-xl hover:bg-accent/60 transition-colors text-muted-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)} 
                className="p-2 rounded-xl hover:bg-accent/60 transition-colors text-muted-foreground relative"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {(notifications || []).some(n => !n.is_read) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-72 md:w-80 bg-popover border border-border rounded-2xl shadow-xl shadow-black/20 z-50 p-4 max-h-96 overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-bold text-foreground text-xs uppercase tracking-wider">Notifications</p>
                      {(notifications || []).length > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">Mark all read</button>
                      )}
                    </div>
                    {(!notifications || notifications.length === 0) ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          onClick={() => markAsRead(n.id)}
                          className={cn("flex items-start gap-3 py-2.5 border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-accent/30 -mx-4 px-4", !n.is_read && "bg-accent/10")}
                        >
                          <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", !n.is_read ? "bg-indigo-500" : "bg-gray-400 dark:bg-gray-600")} />
                          <div>
                            <p className="text-xs font-semibold text-foreground">{n.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 rounded-xl px-2 py-1.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-foreground leading-none">{user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username || 'User'}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Pro plan</p>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main Content Body */}
        <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-t border-border px-3 py-1.5 flex items-center justify-around shadow-lg">
        {mobileNavTabs.map((tab) => {
          const isActive = location.pathname === tab.path || (tab.path !== '/dashboard' && location.pathname.startsWith(tab.path));
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all gap-1 text-[10px] font-semibold",
                isActive 
                  ? "text-indigo-500 dark:text-indigo-400" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn("p-1 rounded-lg transition-colors", isActive && "bg-indigo-500/10")}>
                {tab.icon}
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* Mobile "More" Menu Button */}
        <button
          onClick={() => setMobileMoreOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all gap-1 text-[10px] font-semibold",
            mobileMoreOpen ? "text-indigo-500 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className={cn("p-1 rounded-lg transition-colors", mobileMoreOpen && "bg-indigo-500/10")}>
            <Menu size={20} />
          </div>
          <span>More</span>
        </button>
      </nav>

      {/* Mobile "More" Slide-up Drawer */}
      <AnimatePresence>
        {mobileMoreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMoreOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-3xl p-5 shadow-2xl md:hidden max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
                    <Brain size={18} />
                  </div>
                  <span className="font-bold text-sm text-foreground">Navigation Menu</span>
                </div>
                <button onClick={() => setMobileMoreOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => { setMobileMoreOpen(false); navigate('/resume'); }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/40 hover:bg-indigo-500/10 border border-border text-xs font-semibold text-foreground transition-all"
                >
                  <FileText size={18} className="text-indigo-500" />
                  <span>Resume Analyzer</span>
                </button>

                <button
                  onClick={() => { setMobileMoreOpen(false); navigate('/interviews'); }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/40 hover:bg-indigo-500/10 border border-border text-xs font-semibold text-foreground transition-all"
                >
                  <BarChart3 size={18} className="text-emerald-500" />
                  <span>Reports</span>
                </button>

                <button
                  onClick={() => { setMobileMoreOpen(false); navigate('/certificates'); }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-muted/40 hover:bg-indigo-500/10 border border-border text-xs font-semibold text-foreground transition-all col-span-2"
                >
                  <Award size={18} className="text-amber-500" />
                  <span>Certificates</span>
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-bold text-rose-500 transition-all"
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
