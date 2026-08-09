import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, FileText, Bot, Code2, BarChart3, Award,
  Settings, LogOut, Menu, Home, User, Map, X
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

function cn(...cls: (string | false | null | undefined)[]): string {
  return cls.filter(Boolean).join(" ");
}

const candidateSidebar = [
  { id: "/dashboard", icon: <Home size={18} />, label: "Dashboard" },
  { id: "/roadmap", icon: <Map size={18} />, label: "Roadmap" },
  { id: "/resume", icon: <FileText size={18} />, label: "Resume Analyzer" },
  { id: "/interviews/setup", icon: <Bot size={18} />, label: "AI Interview" },
  { id: "/interviews", icon: <BarChart3 size={18} />, label: "Reports" },
  { id: "/certificates", icon: <Award size={18} />, label: "Certificates" },
];

export default function Sidebar({
  collapsed, setCollapsed, currentPage, onCloseMobile
}: {
  collapsed: boolean; 
  setCollapsed: (c: boolean) => void; 
  currentPage: string;
  onCloseMobile?: () => void;
}) {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const handleLogout = () => {
    logout();
    if (onCloseMobile) onCloseMobile();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    if (onCloseMobile) onCloseMobile();
    navigate(path);
  };

  return (
    <aside className={cn(
      "flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden h-full transition-all duration-200",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Brand Header */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
          <Brain size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-extrabold text-sm text-sidebar-foreground whitespace-nowrap">
            SmartPrep
          </span>
        )}
        <div className="flex-1" />
        {/* Toggle Collapse on Desktop / Close on Mobile */}
        {onCloseMobile ? (
          <button onClick={onCloseMobile} className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1 md:hidden">
            <X size={18} />
          </button>
        ) : (
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1 hidden md:block">
            <Menu size={16} />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
        {candidateSidebar.map((item) => {
          const isActive = currentPage === item.id || (item.id !== "/dashboard" && currentPage.startsWith(item.id));
          return (
            <button 
              key={item.id} 
              onClick={() => handleNavigate(item.id)}
              className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                isActive ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold" : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent")}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="whitespace-nowrap">{item.label}</span>
              )}
            </button>
          );
        })}
        
        {user?.is_staff && (
          <button 
            onClick={() => handleNavigate('/admin')}
            className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 mt-4",
              currentPage.startsWith('/admin') ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold" : "text-amber-600/80 hover:text-amber-500 hover:bg-amber-500/10")}
          >
            <span className="shrink-0"><Settings size={18} /></span>
            {!collapsed && (
              <span className="whitespace-nowrap">Admin Panel</span>
            )}
          </button>
        )}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-2.5 border-t border-sidebar-border space-y-0.5">
        <button 
          onClick={() => handleNavigate('/profile')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all"
        >
          <User size={16} className="shrink-0" />
          {!collapsed && <span>Profile</span>}
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-red-500 hover:bg-red-500/8 transition-all"
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
