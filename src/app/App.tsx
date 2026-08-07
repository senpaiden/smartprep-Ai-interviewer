import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Brain, Code2, FileText, BarChart3, Award, Users, Settings, Bell,
  Search, Moon, Sun, Menu, ChevronRight, ChevronDown, ChevronLeft,
  Play, Pause, Mic, MicOff, Video, VideoOff, Clock, Upload,
  Download, Star, TrendingUp, Target, Zap, CheckCircle,
  XCircle, AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail,
  User, Globe, BookOpen, Trophy, Crown, Layout,
  Activity, LogOut, Plus, Edit, Trash, Filter, RefreshCw,
  MoreHorizontal, Sparkles, Bot, Volume2, Home,
  Terminal, MessageSquare, Calendar, QrCode,
  Cpu, HardDrive, Info, Phone, Linkedin, Github,
  Square, Map, RotateCcw, Share, Navigation
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, AreaChart, Area, ResponsiveContainer,
  PieChart as RPieChart, Pie, Cell,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────
type Page =
  | "landing" | "login" | "register" | "forgot"
  | "dashboard" | "resume" | "interview" | "coding"
  | "report" | "certificate" | "admin" | "leaderboard"
  | "profile" | "settings" | "notifications" | "roadmap";

interface NavProps {
  nav: (page: Page) => void;
  theme?: "dark" | "light";
  setTheme?: (t: "dark" | "light") => void;
}

// ─── Utils ───────────────────────────────────────────────────────────────────
function cn(...cls: (string | false | null | undefined)[]): string {
  return cls.filter(Boolean).join(" ");
}

// ─── Shared Components ───────────────────────────────────────────────────────

function Btn({
  children, variant = "primary", size = "md", className = "", onClick, disabled,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none shrink-0";
  const sizes = { sm: "px-3 py-1.5 text-xs gap-1.5", md: "px-4 py-2 text-sm gap-2", lg: "px-6 py-3 text-base gap-2.5" };
  const variants = {
    primary:
      "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-px",
    secondary: "bg-card border border-border hover:bg-accent/60 text-foreground",
    ghost: "hover:bg-accent/60 text-muted-foreground hover:text-foreground",
    outline: "border border-indigo-500/50 hover:border-indigo-400 text-indigo-400 hover:bg-indigo-500/10",
    danger: "bg-red-600 hover:bg-red-500 text-white",
  };
  return (
    <button
      className={cn(base, sizes[size], variants[variant], disabled && "opacity-50 cursor-not-allowed pointer-events-none", className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function Badge({
  children, color = "default", className = "",
}: {
  children: React.ReactNode;
  color?: "default" | "green" | "blue" | "red" | "yellow" | "purple" | "cyan";
  className?: string;
}) {
  const colors = {
    default: "bg-muted text-muted-foreground",
    green: "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400",
    blue: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
    red: "bg-red-500/15 text-red-500 dark:text-red-400",
    yellow: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    purple: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    cyan: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold", colors[color], className)}>
      {children}
    </span>
  );
}

function Card({
  children, className = "", glass = false, onClick,
}: {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-200",
        glass ? "bg-white/5 backdrop-blur-xl border-white/10" : "bg-card border-border",
        onClick && "cursor-pointer hover:border-indigo-500/40 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/5",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function Field({
  label, type = "text", placeholder, value, onChange, icon, error,
}: {
  label?: string; type?: string; placeholder?: string;
  value?: string; onChange?: (v: string) => void;
  icon?: React.ReactNode; error?: string;
}) {
  const [show, setShow] = useState(false);
  const t = type === "password" ? (show ? "text" : "password") : type;
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-foreground">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>
        )}
        <input
          type={t}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            "w-full bg-input-background border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all duration-200",
            "focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20",
            error ? "border-red-500" : "border-border",
            icon && "pl-10",
            type === "password" && "pr-10",
          )}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function Ring({
  value, size = 80, stroke = 8, color = "#6366f1", label,
}: {
  value: number; size?: number; stroke?: number; color?: string; label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(128,128,168,0.15)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      {label && (
        <div className="absolute text-center">
          <p className="font-bold text-foreground leading-none" style={{ fontSize: size / 4 }}>{label}</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, change, icon, color = "blue" }: {
  label: string; value: string; change?: string; icon: React.ReactNode;
  color?: "blue" | "purple" | "green" | "orange";
}) {
  const grad = {
    blue: "from-indigo-600/15 to-indigo-500/5 border-indigo-500/20",
    purple: "from-violet-600/15 to-violet-500/5 border-violet-500/20",
    green: "from-emerald-600/15 to-emerald-500/5 border-emerald-500/20",
    orange: "from-amber-600/15 to-amber-500/5 border-amber-500/20",
  };
  const ic = {
    blue: "text-indigo-500 dark:text-indigo-400",
    purple: "text-violet-500 dark:text-violet-400",
    green: "text-emerald-500 dark:text-emerald-400",
    orange: "text-amber-500 dark:text-amber-400",
  };
  return (
    <Card className={cn("p-5 bg-gradient-to-br", grad[color])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-extrabold text-foreground mt-1">{value}</p>
          {change && (
            <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp size={11} />{change}
            </p>
          )}
        </div>
        <div className={cn("p-2.5 rounded-xl bg-white/10 dark:bg-black/10", ic[color])}>{icon}</div>
      </div>
    </Card>
  );
}

// ─── Landing Nav ─────────────────────────────────────────────────────────────

function LandingNav({ nav, theme, setTheme }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-lg shadow-black/5"
          : "bg-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => nav("landing")} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-foreground">InterviewAI</span>
        </button>
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Pricing", "Companies", "Blog"].map((item) => (
            <a key={item} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{item}</a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme?.(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-accent/60 transition-colors"
          >
            {theme === "dark"
              ? <Sun size={18} className="text-muted-foreground" />
              : <Moon size={18} className="text-muted-foreground" />}
          </button>
          <Btn variant="ghost" size="sm" onClick={() => nav("login")}>Sign in</Btn>
          <Btn size="sm" onClick={() => nav("register")}>Get started <ArrowRight size={14} /></Btn>
        </div>
      </div>
    </nav>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPage({ nav, theme, setTheme }: NavProps) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingNav nav={nav} theme={theme} setTheme={setTheme} />
      <HeroSection nav={nav} />
      <TrustedSection />
      <FeaturesSection />
      <StatsSection />
      <DemoSection nav={nav} />
      <TestimonialsSection />
      <PricingSection nav={nav} />
      <FAQSection />
      <LandingFooter nav={nav} />
    </div>
  );
}

function HeroSection({ nav }: { nav: (p: Page) => void }) {
  return (
    <section className="relative pt-32 pb-24 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none select-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-indigo-600/10 dark:bg-indigo-600/12 rounded-full blur-[120px]" />
        <div className="absolute top-24 left-1/4 w-[400px] h-[300px] bg-violet-600/8 rounded-full blur-[80px]" />
        <div className="absolute top-40 right-1/4 w-[350px] h-[300px] bg-cyan-600/6 rounded-full blur-[70px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>
      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Badge color="purple" className="px-3 py-1">
            <Sparkles size={11} className="mr-1.5" />Powered by GPT-4o &amp; Claude 3.7
          </Badge>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-5xl md:text-7xl font-extrabold text-foreground leading-[1.08] tracking-tight"
        >
          Ace Every Interview<br />
          <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
            With AI Coaching
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Practice with our AI interviewer, get real-time feedback, analyze your resume with ATS scoring, and land your dream job with personalized coaching.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Btn size="lg" onClick={() => nav("register")}>
            <Sparkles size={18} />Start Free Interview
          </Btn>
          <Btn variant="outline" size="lg" onClick={() => nav("interview")}>
            <Play size={18} />Watch Demo
          </Btn>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          {["No credit card required", "14-day free trial", "Cancel anytime"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle size={14} className="text-emerald-500" />{t}
            </span>
          ))}
        </motion.div>

        {/* Browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45 }}
          className="mt-16 relative mx-auto max-w-4xl"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 via-violet-500/30 to-cyan-500/30 rounded-3xl blur-xl" />
          <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/40">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
              <div className="flex-1 mx-4 bg-background/50 rounded-md px-3 py-1 text-xs text-muted-foreground text-left">
                app.interviewai.com/interview
              </div>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4 min-h-[280px]">
              <div className="col-span-1 flex flex-col gap-3">
                <div className="aspect-video bg-gradient-to-br from-indigo-900/60 to-violet-900/40 rounded-xl border border-indigo-500/20 flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.15),transparent_60%)]" />
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center z-10">
                    <Bot size={26} className="text-white" />
                  </div>
                  <div className="flex gap-1 z-10">
                    {[4, 7, 5, 8, 4, 7, 5].map((h, i) => (
                      <motion.div
                        key={i} className="w-1 bg-indigo-400 rounded-full"
                        animate={{ height: [h * 2, h * 3.5, h * 2] }}
                        transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.09 }}
                        style={{ height: h * 2 }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-indigo-300 font-medium z-10">AI Interviewer</p>
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="aspect-video bg-muted/50 rounded-xl border border-border flex flex-col items-center justify-center gap-1">
                  <User size={18} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">You</span>
                </div>
              </div>
              <div className="col-span-2 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Transcript</span>
                  <Badge color="green">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block mr-1" />Recording
                  </Badge>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot size={12} className="text-indigo-400" />
                    </div>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl rounded-tl-none px-3 py-2 text-xs text-foreground leading-relaxed">
                      Tell me about a challenging problem you solved and how you approached it.
                    </div>
                  </div>
                  <div className="flex gap-2 flex-row-reverse">
                    <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User size={12} className="text-violet-400" />
                    </div>
                    <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl rounded-tr-none px-3 py-2 text-xs text-foreground leading-relaxed">
                      During my last role, I led the migration of our monolithic backend to microservices...
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Bot size={12} className="text-indigo-400" />
                    </div>
                    {[0.1, 0.25, 0.4].map((d) => (
                      <motion.div key={d} className="w-2 h-2 rounded-full bg-indigo-400"
                        animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: d }} />
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[["Confidence", "87%", "text-emerald-500 dark:text-emerald-400"], ["Communication", "92%", "text-indigo-500 dark:text-indigo-400"], ["Technical", "79%", "text-violet-500 dark:text-violet-400"]].map(([l, v, c]) => (
                    <div key={l} className="bg-muted/40 rounded-lg p-2 text-center">
                      <p className={cn("text-sm font-bold", c)}>{v}</p>
                      <p className="text-[10px] text-muted-foreground">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TrustedSection() {
  const companies = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix", "Stripe", "Notion", "Vercel", "Linear"];
  return (
    <section className="py-14 border-y border-border overflow-hidden">
      <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-10">
        Trusted by candidates at world-class companies
      </p>
      <div className="flex items-center gap-16 overflow-hidden">
        <motion.div
          className="flex gap-16 items-center shrink-0"
          animate={{ x: [0, -1200] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          {[...companies, ...companies].map((c, i) => (
            <span key={i} className="text-xl font-extrabold text-muted-foreground/35 hover:text-muted-foreground/60 transition-colors whitespace-nowrap cursor-default">{c}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const features = [
  { icon: <Bot size={22} />, title: "AI-Powered Interviews", desc: "Practice with our GPT-4o powered interviewer that adapts to your level and gives real-time feedback on confidence, clarity, and content.", badge: "Core", bc: "blue" as const },
  { icon: <FileText size={22} />, title: "Resume ATS Analyzer", desc: "Upload your resume and get an instant ATS compatibility score, keyword analysis, grammar check, and AI-powered improvement suggestions.", badge: "Popular", bc: "purple" as const },
  { icon: <Code2 size={22} />, title: "Live Coding Challenges", desc: "Solve real interview problems in our Monaco-powered editor with AI code review, complexity analysis, and execution metrics.", badge: "New", bc: "green" as const },
  { icon: <BarChart3 size={22} />, title: "Performance Analytics", desc: "Deep-dive reports with radar charts, confidence scores, communication analysis, and a detailed breakdown of every session.", badge: "Insights", bc: "yellow" as const },
  { icon: <Award size={22} />, title: "Verified Certificates", desc: "Earn blockchain-verified certificates for completed interviews and share them directly on LinkedIn or download as PDF.", badge: "Credibility", bc: "blue" as const },
  { icon: <BookOpen size={22} />, title: "Learning Roadmap", desc: "Get a personalized study plan based on your weak spots, with curated resources, practice problems, and milestone tracking.", badge: "Growth", bc: "purple" as const },
];

const iconBg = { blue: "bg-indigo-500/15 text-indigo-500 dark:text-indigo-400", purple: "bg-violet-500/15 text-violet-500 dark:text-violet-400", green: "bg-emerald-500/15 text-emerald-500 dark:text-emerald-400", yellow: "bg-amber-500/15 text-amber-500 dark:text-amber-400" };

function FeaturesSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <Badge color="blue">Features</Badge>
          <h2 className="mt-4 text-4xl font-extrabold text-foreground">Everything you need to<br />land your dream job</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">A complete interview preparation platform powered by state-of-the-art AI, built for serious candidates.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }} viewport={{ once: true }}
            >
              <Card className="p-6 h-full hover:border-indigo-500/30">
                <div className="flex items-start justify-between mb-4">
                  <div className={cn("p-3 rounded-xl", iconBg[f.bc])}>{f.icon}</div>
                  <Badge color={f.bc}>{f.badge}</Badge>
                </div>
                <h3 className="font-bold text-foreground mb-2 text-base">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: "127K+", label: "Interviews Conducted", icon: <Activity size={22} /> },
    { value: "94%", label: "Success Rate", icon: <Trophy size={22} /> },
    { value: "2.3M+", label: "Practice Sessions", icon: <Target size={22} /> },
    { value: "4.9/5", label: "User Rating", icon: <Star size={22} /> },
  ];
  return (
    <section className="py-16 px-6 bg-gradient-to-r from-indigo-600/8 via-violet-600/6 to-indigo-600/8 border-y border-indigo-500/10">
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.08 }} viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-indigo-500 dark:text-indigo-400 flex justify-center mb-3">{s.icon}</div>
            <p className="text-3xl font-extrabold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function DemoSection({ nav }: { nav: (p: Page) => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ["Resume Analysis", "Mock Interview", "Code Challenge", "Performance Report"];
  const radarData = [
    { subject: "Confidence", A: 87 }, { subject: "Communication", A: 92 },
    { subject: "Technical", A: 79 }, { subject: "Problem Solving", A: 85 },
    { subject: "Behavior", A: 91 }, { subject: "Coding", A: 83 },
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge color="purple"><Sparkles size={10} className="mr-1" />Live Demo</Badge>
          <h2 className="mt-4 text-4xl font-extrabold text-foreground">See InterviewAI in action</h2>
          <p className="mt-4 text-muted-foreground">Experience every feature without signing up.</p>
        </div>
        <div className="flex gap-2 justify-center flex-wrap mb-8">
          {tabs.map((t, i) => (
            <button key={t} onClick={() => setActiveTab(i)}
              className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-all", activeTab === i ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-muted/60 text-muted-foreground hover:text-foreground")}>
              {t}
            </button>
          ))}
        </div>
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-600/15 to-violet-600/15 rounded-3xl blur-xl" />
          <Card className="relative p-8 min-h-[380px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }} className="w-full">
                {activeTab === 0 && (
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="font-bold text-foreground text-lg">ATS Resume Score</h3>
                      <div className="flex items-center gap-6">
                        <Ring value={87} size={96} stroke={9} label="87%" color="#6366f1" />
                        <div className="space-y-2.5 flex-1">
                          {[["Keywords", 92, "#6366f1"], ["Format", 88, "#8b5cf6"], ["Grammar", 98, "#10b981"], ["Content", 81, "#f59e0b"]].map(([l, v, c]) => (
                            <div key={l as string}>
                              <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{l}</span><span className="font-semibold text-foreground">{v}%</span></div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${v}%`, backgroundColor: c as string }} /></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Missing Keywords</p>
                        <div className="flex flex-wrap gap-2">{["Kubernetes", "GraphQL", "System Design", "Redis"].map((k) => (<span key={k} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-500 dark:text-red-400">{k}</span>))}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Suggestions</p>
                      {[
                        { t: "success", m: "Strong quantified achievements detected (+40% revenue, 3x performance)" },
                        { t: "warning", m: "Add cloud certifications (AWS/GCP) to boost technical credibility" },
                        { t: "info", m: "Include \"System Design\" experience — in 80% of senior role listings" },
                      ].map((s, i) => (
                        <div key={i} className={cn("flex gap-3 p-3 rounded-xl text-sm", s.t === "success" ? "bg-emerald-500/10 border border-emerald-500/20" : s.t === "warning" ? "bg-amber-500/10 border border-amber-500/20" : "bg-indigo-500/10 border border-indigo-500/20")}>
                          {s.t === "success" ? <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" /> : s.t === "warning" ? <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" /> : <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />}
                          <span className="text-muted-foreground">{s.m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 1 && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="aspect-video bg-gradient-to-br from-indigo-900/50 to-violet-900/30 rounded-xl border border-indigo-500/20 flex flex-col items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-indigo-500/30 flex items-center justify-center">
                          <Bot size={26} className="text-indigo-300" />
                        </div>
                        <div className="flex gap-0.5 mt-2">
                          {[3, 6, 4, 7, 3, 5].map((h, i) => (
                            <motion.div key={i} className="w-0.5 bg-indigo-400 rounded-full" animate={{ height: [h, h * 2, h] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} style={{ height: h }} />
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 justify-center">
                        <button className="p-2 bg-red-500/15 rounded-lg"><MicOff size={14} className="text-red-400" /></button>
                        <button className="p-2 bg-muted rounded-lg"><Video size={14} className="text-muted-foreground" /></button>
                        <button className="p-2 bg-muted rounded-lg"><Pause size={14} className="text-muted-foreground" /></button>
                      </div>
                    </div>
                    <div className="col-span-2 space-y-3">
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                        <p className="text-xs text-indigo-500 dark:text-indigo-400 mb-2 font-semibold">Question 3 of 10</p>
                        <p className="text-sm text-foreground">Describe your experience with distributed systems and how you&apos;ve handled consistency challenges.</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock size={12} /> 2:34 left</span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full"><div className="h-full w-1/3 bg-indigo-500 rounded-full" /></div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[["Pace", "Good", "text-emerald-500"], ["Filler Words", "3", "text-amber-500"], ["Clarity", "89%", "text-indigo-500"]].map(([l, v, c]) => (
                          <div key={l} className="bg-muted/40 rounded-xl p-3 text-center">
                            <p className={cn("font-bold text-sm", c)}>{v}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{l}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 2 && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-muted-foreground">JavaScript</span>
                        <div className="flex gap-2"><Badge color="green">4/4 Passed</Badge><Badge color="blue">O(n)</Badge></div>
                      </div>
                      <pre className="bg-muted/40 rounded-xl p-4 text-xs font-mono text-foreground overflow-auto leading-relaxed">{`function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (map.has(comp)) return [map.get(comp), i];
    map.set(nums[i], i);
  }
  return [];
}`}</pre>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Cpu size={12} />72ms · beats 94%</span>
                        <span className="flex items-center gap-1"><HardDrive size={12} />41.2MB</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Code Review</p>
                      {[
                        { t: "success", m: "Optimal HashMap approach — O(n) time complexity ✓" },
                        { t: "success", m: "Clean variable naming and readable structure ✓" },
                        { t: "info", m: "Consider adding guard for empty array input" },
                      ].map((s, i) => (
                        <div key={i} className={cn("flex gap-3 p-3 rounded-xl text-xs", s.t === "success" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-indigo-500/10 border border-indigo-500/20")}>
                          {s.t === "success" ? <CheckCircle size={14} className="text-emerald-500 shrink-0" /> : <Info size={14} className="text-indigo-500 shrink-0" />}
                          <span className="text-muted-foreground">{s.m}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeTab === 3 && (
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <ResponsiveContainer width="100%" height={260}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(99,102,241,0.15)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "#8080a8", fontSize: 11 }} />
                        <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <div className="space-y-3">
                      <div className="text-center mb-4">
                        <p className="text-5xl font-extrabold text-foreground">86<span className="text-2xl text-muted-foreground">/100</span></p>
                        <p className="text-sm text-muted-foreground mt-1">Overall Interview Score</p>
                        <Badge color="green" className="mt-2">Top 12% of candidates</Badge>
                      </div>
                      {radarData.map((d) => (
                        <div key={d.subject} className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-28 shrink-0">{d.subject}</span>
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${d.A}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-foreground w-8">{d.A}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </Card>
        </div>
        <div className="text-center mt-8">
          <Btn size="lg" onClick={() => nav("register")}>Start Free Trial <ArrowRight size={18} /></Btn>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    { name: "Sarah Chen", role: "Software Engineer at Google", initials: "SC", rating: 5, text: "InterviewAI helped me land my dream job at Google. The AI mock interviews were incredibly realistic, and the feedback was spot-on. I went from bombing interviews to acing them all in 6 weeks." },
    { name: "Marcus Johnson", role: "SRE at Stripe", initials: "MJ", rating: 5, text: "The coding challenge platform is phenomenal. Real interview questions, AI code review, and performance metrics that actually help you improve. Worth every penny of the subscription." },
    { name: "Priya Patel", role: "Product Manager at Meta", initials: "PP", rating: 5, text: "The behavioral interview practice was life-changing. The AI picked up on subtle communication patterns I never noticed myself and coached me to fix them before the real interviews." },
    { name: "David Kim", role: "ML Engineer at OpenAI", initials: "DK", rating: 5, text: "The resume ATS analyzer alone is worth the subscription. It identified missing keywords that tripled my callback rate. Combined with the mock interviews — unstoppable combination." },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % testimonials.length), 5000);
    return () => clearInterval(t);
  }, []);
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background via-indigo-600/4 to-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Badge color="purple">Testimonials</Badge>
          <h2 className="mt-4 text-4xl font-extrabold text-foreground">Loved by 50,000+ candidates</h2>
        </div>
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
              <Card className="p-8 text-center max-w-2xl mx-auto" glass>
                <div className="flex justify-center gap-1 mb-5">
                  {Array.from({ length: testimonials[idx].rating }).map((_, i) => (
                    <Star key={i} size={18} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-lg text-foreground leading-relaxed mb-6">&ldquo;{testimonials[idx].text}&rdquo;</p>
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                    {testimonials[idx].initials}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm">{testimonials[idx].name}</p>
                    <p className="text-xs text-muted-foreground">{testimonials[idx].role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-6 bg-indigo-500" : "w-1.5 bg-muted-foreground/30")} />
            ))}
          </div>
          <button onClick={() => setIdx((idx - 1 + testimonials.length) % testimonials.length)}
            className="absolute left-0 top-1/3 -translate-x-6 p-2 rounded-full bg-card border border-border hover:border-indigo-500/40 transition-all">
            <ChevronLeft size={16} className="text-muted-foreground" />
          </button>
          <button onClick={() => setIdx((idx + 1) % testimonials.length)}
            className="absolute right-0 top-1/3 translate-x-6 p-2 rounded-full bg-card border border-border hover:border-indigo-500/40 transition-all">
            <ChevronRight size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </section>
  );
}

function PricingSection({ nav }: { nav: (p: Page) => void }) {
  const [annual, setAnnual] = useState(false);
  const plans = [
    { name: "Starter", price: 0, desc: "Perfect for trying out InterviewAI", features: ["3 AI mock interviews/month", "Resume ATS analysis", "Basic performance report", "Email support"], cta: "Get started free", highlight: false },
    { name: "Pro", price: 29, desc: "For serious job seekers", features: ["Unlimited AI mock interviews", "Advanced resume analyzer", "Live coding challenges", "Detailed performance reports", "Certificate generation", "Priority support", "LinkedIn integration"], cta: "Start Pro trial", highlight: true },
    { name: "Team", price: 99, desc: "For bootcamps &amp; hiring teams", features: ["Everything in Pro", "Team dashboard", "Custom question banks", "Bulk scheduling", "API access", "White-label certificates", "Dedicated account manager"], cta: "Contact sales", highlight: false },
  ];
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Badge color="green">Pricing</Badge>
          <h2 className="mt-4 text-4xl font-extrabold text-foreground">Simple, transparent pricing</h2>
          <p className="mt-4 text-muted-foreground">Start free, upgrade when you&apos;re ready.</p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={cn("text-sm", !annual ? "text-foreground font-semibold" : "text-muted-foreground")}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} className={cn("w-12 h-6 rounded-full transition-all relative", annual ? "bg-indigo-600" : "bg-muted")}>
              <div className="w-[18px] h-[18px] rounded-full bg-white absolute top-[3px] transition-all shadow-sm" style={{ left: annual ? "22px" : "3px" }} />
            </button>
            <span className={cn("text-sm flex items-center gap-2", annual ? "text-foreground font-semibold" : "text-muted-foreground")}>Annual <Badge color="green">-20%</Badge></span>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}>
              <Card className={cn("p-6 h-full flex flex-col relative overflow-hidden", p.highlight && "border-indigo-500/60 shadow-2xl shadow-indigo-500/10")}>
                {p.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"><Badge color="purple"><Sparkles size={10} className="mr-1" />Most Popular</Badge></div>}
                {p.highlight && <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />}
                <div className="relative z-10">
                  <h3 className="font-extrabold text-foreground text-lg">{p.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.desc}</p>
                  <div className="mt-4 mb-6 flex items-end gap-1">
                    <span className="text-4xl font-extrabold text-foreground">${annual ? Math.round(p.price * 0.8) : p.price}</span>
                    {p.price > 0 && <span className="text-muted-foreground pb-1">/mo</span>}
                  </div>
                  <ul className="space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle size={15} className="text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
                <Btn variant={p.highlight ? "primary" : "outline"} className="mt-6 w-full" onClick={() => nav("register")}>
                  {p.cta}
                </Btn>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    { q: "How realistic are the AI mock interviews?", a: "Our AI interviewer is powered by GPT-4o and trained on thousands of real interview transcripts. It adapts to your responses, asks follow-up questions, and evaluates you on the same criteria as human interviewers at top tech companies." },
    { q: "Can I practice for specific companies?", a: "Yes! We have company-specific interview tracks for Google, Meta, Amazon, Microsoft, Apple, and 200+ other companies, with curated questions and role-specific evaluation criteria." },
    { q: "How does the ATS resume analyzer work?", a: "We parse your resume against ATS algorithms used by Fortune 500 companies, checking for keyword density, format compatibility, grammar, and content quality — then give you actionable improvement suggestions." },
    { q: "Are the certificates recognized by employers?", a: "Our certificates are digitally signed and verifiable via QR code. While they don't replace qualifications, they demonstrate initiative and preparation quality to hiring managers." },
    { q: "What interview types are supported?", a: "Behavioral (STAR format), technical, system design, coding challenges, case studies, PM interviews, and role-specific tracks for Engineering, Product, Design, Data Science, and more." },
  ];
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <Badge>FAQ</Badge>
          <h2 className="mt-4 text-4xl font-extrabold text-foreground">Frequently asked questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <Card key={i} className="overflow-hidden">
              <button className="w-full flex items-center justify-between px-6 py-4 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <span className="font-semibold text-foreground text-sm">{f.q}</span>
                <ChevronDown size={16} className={cn("text-muted-foreground transition-transform shrink-0 ml-4", open === i && "rotate-180")} />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <p className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function LandingFooter({ nav }: { nav: (p: Page) => void }) {
  return (
    <footer className="border-t border-border py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <button onClick={() => nav("landing")} className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Brain size={18} className="text-white" />
              </div>
              <span className="font-extrabold text-foreground">InterviewAI</span>
            </button>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xs">The most advanced AI interview preparation platform. Land your dream job with confidence.</p>
            <div className="flex gap-3">
              {[<Github key="gh" size={16} />, <Linkedin key="li" size={16} />, <Globe key="gl" size={16} />].map((Icon, i) => (
                <div key={i} className="w-8 h-8 rounded-lg bg-muted hover:bg-accent/60 flex items-center justify-center cursor-pointer transition-colors text-muted-foreground">{Icon}</div>
              ))}
            </div>
          </div>
          {[
            { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
            { title: "Support", links: ["Documentation", "API Reference", "Status", "Contact"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-bold text-foreground text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2">{col.links.map((l) => <li key={l} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">{l}</li>)}</ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2025 InterviewAI Inc. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookies"].map((l) => <a key={l} className="hover:text-foreground cursor-pointer transition-colors">{l}</a>)}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Auth Layout ──────────────────────────────────────────────────────────────

function AuthLayout({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.07)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-white text-lg">InterviewAI</span>
        </div>
        <div className="relative space-y-8">
          <div className="space-y-4">
            {[
              { icon: <Bot size={18} />, title: "AI-Powered Practice", desc: "10,000+ realistic interview questions" },
              { icon: <BarChart3 size={18} />, title: "Real-time Analytics", desc: "Track every aspect of your performance" },
              { icon: <Award size={18} />, title: "Verified Certificates", desc: "Showcase your interview readiness" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-white/10 text-indigo-300 shrink-0">{item.icon}</div>
                <div>
                  <p className="font-semibold text-white text-sm">{item.title}</p>
                  <p className="text-xs text-indigo-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
            <div className="flex -space-x-2">
              {["A", "B", "C", "D"].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold border-2 border-indigo-950">{l}</div>
              ))}
            </div>
            <p className="text-sm text-indigo-300"><span className="text-white font-bold">50,000+</span> candidates hired</p>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-extrabold text-foreground mb-1">{title}</h1>
          <p className="text-sm text-muted-foreground mb-8">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function LoginPage({ nav }: NavProps) {
  const [email, setEmail] = useState("alex@example.com");
  const [password, setPassword] = useState("MySecret123");
  const [loading, setLoading] = useState(false);
  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); nav("dashboard"); }, 1000);
  };
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your InterviewAI account">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[{ icon: <Github size={16} />, label: "GitHub" }, { icon: <Globe size={16} />, label: "Google" }].map((s) => (
            <Btn key={s.label} variant="secondary" className="w-full gap-2">{s.icon} {s.label}</Btn>
          ))}
        </div>
        <div className="relative flex items-center"><div className="flex-1 border-t border-border" /><span className="px-4 text-xs text-muted-foreground">or continue with email</span><div className="flex-1 border-t border-border" /></div>
        <Field label="Email address" type="email" placeholder="alex@example.com" value={email} onChange={setEmail} icon={<Mail size={16} />} />
        <Field label="Password" type="password" placeholder="Your password" value={password} onChange={setPassword} icon={<Lock size={16} />} />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-border accent-indigo-600" defaultChecked />
            <span className="text-sm text-muted-foreground">Remember me</span>
          </label>
          <button onClick={() => nav("forgot")} className="text-sm text-indigo-500 dark:text-indigo-400 hover:underline">Forgot password?</button>
        </div>
        <Btn className="w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? <><RefreshCw size={16} className="animate-spin" />Signing in...</> : "Sign in"}
        </Btn>
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <button onClick={() => nav("register")} className="text-indigo-500 dark:text-indigo-400 font-semibold hover:underline">Create one free</button>
        </p>
      </div>
    </AuthLayout>
  );
}

function RegisterPage({ nav }: NavProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const sLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const sColors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];
  return (
    <AuthLayout title="Create your account" subtitle="Start your free 14-day trial — no credit card required.">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[{ icon: <Github size={16} />, label: "GitHub" }, { icon: <Globe size={16} />, label: "Google" }].map((s) => (
            <Btn key={s.label} variant="secondary" className="w-full gap-2">{s.icon} {s.label}</Btn>
          ))}
        </div>
        <div className="relative flex items-center"><div className="flex-1 border-t border-border" /><span className="px-4 text-xs text-muted-foreground">or use email</span><div className="flex-1 border-t border-border" /></div>
        <Field label="Full name" placeholder="Alex Johnson" value={name} onChange={setName} icon={<User size={16} />} />
        <Field label="Work email" type="email" placeholder="alex@company.com" value={email} onChange={setEmail} icon={<Mail size={16} />} />
        <div className="space-y-2">
          <Field label="Password" type="password" placeholder="Min. 8 characters" value={password} onChange={setPassword} icon={<Lock size={16} />} />
          {password.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex gap-1">{[1, 2, 3, 4].map((i) => (<div key={i} className="flex-1 h-1.5 rounded-full transition-all duration-300" style={{ backgroundColor: i <= strength ? sColors[strength] : "rgba(128,128,168,0.15)" }} />))}</div>
              <p className="text-xs font-semibold" style={{ color: sColors[strength] }}>{sLabels[strength]} password</p>
            </div>
          )}
        </div>
        <Btn className="w-full" onClick={() => nav("dashboard")}>Create free account <ArrowRight size={16} /></Btn>
        <p className="text-center text-xs text-muted-foreground">
          By signing up you agree to our <span className="text-indigo-500 cursor-pointer hover:underline">Terms</span> and <span className="text-indigo-500 cursor-pointer hover:underline">Privacy Policy</span>
        </p>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <button onClick={() => nav("login")} className="text-indigo-500 dark:text-indigo-400 font-semibold hover:underline">Sign in</button>
        </p>
      </div>
    </AuthLayout>
  );
}

function ForgotPage({ nav }: NavProps) {
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link.">
      {sent ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h3 className="font-bold text-foreground">Check your inbox</h3>
          <p className="text-sm text-muted-foreground">We sent a reset link to your email. It expires in 30 minutes.</p>
          <Btn variant="outline" className="w-full" onClick={() => nav("login")}>Back to sign in</Btn>
        </div>
      ) : (
        <div className="space-y-4">
          <Field label="Email address" type="email" placeholder="alex@example.com" icon={<Mail size={16} />} />
          <Btn className="w-full" onClick={() => setSent(true)}>Send reset link</Btn>
          <p className="text-center text-sm text-muted-foreground">
            <button onClick={() => nav("login")} className="text-indigo-500 hover:underline">Back to sign in</button>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}

// ─── Dashboard Layout ─────────────────────────────────────────────────────────

const candidateSidebar = [
  { id: "dashboard", icon: <Home size={18} />, label: "Dashboard" },
  { id: "resume", icon: <FileText size={18} />, label: "Resume Analyzer" },
  { id: "interview", icon: <Bot size={18} />, label: "AI Interview" },
  { id: "coding", icon: <Code2 size={18} />, label: "Coding" },
  { id: "report", icon: <BarChart3 size={18} />, label: "Reports" },
  { id: "certificate", icon: <Award size={18} />, label: "Certificates" },
  { id: "leaderboard", icon: <Trophy size={18} />, label: "Leaderboard" },
  { id: "roadmap", icon: <Navigation size={18} />, label: "Roadmap" },
];
const adminSidebar = [
  { id: "admin", icon: <Layout size={18} />, label: "Overview" },
  { id: "leaderboard", icon: <Users size={18} />, label: "Users" },
  { id: "coding", icon: <MessageSquare size={18} />, label: "Questions" },
  { id: "report", icon: <BarChart3 size={18} />, label: "Analytics" },
  { id: "certificate", icon: <Award size={18} />, label: "Certificates" },
  { id: "settings", icon: <Settings size={18} />, label: "Settings" },
];

function DashboardLayout({
  children, nav, theme, setTheme, currentPage, isAdmin = false,
}: {
  children: React.ReactNode;
  nav: (p: Page) => void;
  theme?: "dark" | "light";
  setTheme?: (t: "dark" | "light") => void;
  currentPage: string;
  isAdmin?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const items = isAdmin ? adminSidebar : candidateSidebar;
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <motion.aside animate={{ width: collapsed ? 64 : 240 }} transition={{ duration: 0.22, ease: "easeInOut" }}
        className="flex flex-col bg-sidebar border-r border-sidebar-border shrink-0 overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
            <Brain size={16} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                className="font-extrabold text-sm text-sidebar-foreground whitespace-nowrap">
                InterviewAI
              </motion.span>
            )}
          </AnimatePresence>
          <div className="flex-1" />
          <button onClick={() => setCollapsed(!collapsed)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <Menu size={16} />
          </button>
        </div>
        <nav className="flex-1 p-2.5 space-y-0.5">
          {items.map((item) => (
            <button key={item.id} onClick={() => nav(item.id as Page)}
              className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                currentPage === item.id ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-semibold" : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent")}>
              <span className="shrink-0">{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="whitespace-nowrap">{item.label}</motion.span>
                )}
              </AnimatePresence>
            </button>
          ))}
        </nav>
        <div className="p-2.5 border-t border-sidebar-border space-y-0.5">
          {[{ id: "profile" as Page, icon: <User size={16} />, label: "Profile" }, { id: "settings" as Page, icon: <Settings size={16} />, label: "Settings" }].map((item) => (
            <button key={item.id} onClick={() => nav(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-all">
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
          <button onClick={() => nav("landing")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-red-500 hover:bg-red-500/8 transition-all">
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/80 backdrop-blur-md shrink-0">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search..." className="bg-input-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm w-56 text-foreground placeholder:text-muted-foreground outline-none focus:border-indigo-500 transition-colors" />
          </div>
          <div className="flex items-center gap-2">
            {setTheme && (
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg hover:bg-accent/60 transition-colors">
                {theme === "dark" ? <Sun size={18} className="text-muted-foreground" /> : <Moon size={18} className="text-muted-foreground" />}
              </button>
            )}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="p-2 rounded-lg hover:bg-accent/60 transition-colors relative">
                <Bell size={18} className="text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-2xl shadow-xl shadow-black/10 z-50 p-4">
                  <p className="font-bold text-foreground text-sm mb-3">Notifications</p>
                  {[
                    { title: "Interview report ready", time: "5 min ago", c: "bg-indigo-400" },
                    { title: "New badge: Speed Coder", time: "1 hr ago", c: "bg-violet-400" },
                    { title: "Resume score improved +12pts", time: "3 hrs ago", c: "bg-emerald-400" },
                  ].map((n, i) => (
                    <div key={i} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                      <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", n.c)} />
                      <div><p className="text-sm text-foreground">{n.title}</p><p className="text-xs text-muted-foreground">{n.time}</p></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => nav("profile")} className="flex items-center gap-2 hover:bg-accent/60 rounded-xl px-2 py-1.5 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">AJ</div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-foreground leading-none">Alex Johnson</p>
                <p className="text-xs text-muted-foreground">Pro plan</p>
              </div>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

function DashboardPage({ nav, theme, setTheme }: NavProps) {
  const weekData = [
    { day: "Mon", score: 78 }, { day: "Tue", score: 82 }, { day: "Wed", score: 79 },
    { day: "Thu", score: 85 }, { day: "Fri", score: 88 }, { day: "Sat", score: 91 }, { day: "Sun", score: 87 },
  ];
  const skillData = [
    { subject: "Confidence", A: 87 }, { subject: "Communication", A: 92 },
    { subject: "Technical", A: 79 }, { subject: "Problem Solving", A: 85 },
    { subject: "Behavior", A: 91 }, { subject: "Coding", A: 83 },
  ];
  return (
    <DashboardLayout nav={nav} theme={theme} setTheme={setTheme} currentPage="dashboard">
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Welcome banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6">
          <div className="absolute right-0 top-0 w-64 h-full opacity-10 flex items-center justify-center">
            <Brain size={160} className="absolute -right-8 -top-4" />
          </div>
          <p className="text-indigo-200 text-sm mb-1">Good afternoon</p>
          <h2 className="text-2xl font-extrabold text-white mb-2">Welcome back, Alex! 👋</h2>
          <p className="text-indigo-100 text-sm mb-5 max-w-lg">You&apos;ve completed 12 interviews this week. Your score improved by 8 points — keep the momentum going!</p>
          <div className="flex gap-3 flex-wrap">
            <Btn className="bg-white text-indigo-600 hover:bg-indigo-50 shadow-none border-0" onClick={() => nav("interview")}><Play size={16} />Start Interview</Btn>
            <Btn className="bg-white/20 hover:bg-white/30 text-white shadow-none border-0" onClick={() => nav("resume")}><FileText size={16} />Analyze Resume</Btn>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Resume Score" value="87/100" change="+5 this week" icon={<FileText size={20} />} color="blue" />
          <StatCard label="ATS Score" value="92%" change="+3% improved" icon={<Target size={20} />} color="purple" />
          <StatCard label="Interviews Done" value="47" change="+12 this week" icon={<Bot size={20} />} color="green" />
          <StatCard label="Avg. Score" value="84.2" change="+8.1 pts" icon={<TrendingUp size={20} />} color="orange" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <h3 className="font-bold text-foreground mb-4">Weekly Performance</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weekData}>
                <defs>
                  <linearGradient id="sGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,168,0.1)" />
                <XAxis dataKey="day" tick={{ fill: "#8080a8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8080a8", fontSize: 12 }} axisLine={false} tickLine={false} domain={[60, 100]} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" fill="url(#sGrad)" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-foreground mb-4">Skill Radar</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={skillData}>
                <PolarGrid stroke="rgba(99,102,241,0.15)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#8080a8", fontSize: 9 }} />
                <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Upcoming Interviews</h3>
              <Btn variant="ghost" size="sm" onClick={() => nav("interview")}><Plus size={14} />Schedule</Btn>
            </div>
            <div className="space-y-3">
              {[
                { title: "Google SWE Mock Interview", time: "Today, 3:00 PM", type: "Technical" },
                { title: "Meta System Design Round", time: "Tomorrow, 11:00 AM", type: "System Design" },
                { title: "Behavioral STAR Practice", time: "Jul 5, 2:00 PM", type: "Behavioral" },
              ].map((u, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl hover:bg-muted/60 cursor-pointer transition-colors" onClick={() => nav("interview")}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center"><Calendar size={16} className="text-indigo-500 dark:text-indigo-400" /></div>
                    <div><p className="font-semibold text-foreground text-sm">{u.title}</p><p className="text-xs text-muted-foreground">{u.time}</p></div>
                  </div>
                  <Badge color="blue">{u.type}</Badge>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Recent Certificates</h3>
              <Btn variant="ghost" size="sm" onClick={() => nav("certificate")}>View all</Btn>
            </div>
            <div className="space-y-3">
              {[
                { title: "Google SWE Interview Prep", score: 91, date: "Jun 28, 2025" },
                { title: "System Design Mastery", score: 87, date: "Jun 22, 2025" },
                { title: "Behavioral Expert", score: 94, date: "Jun 15, 2025" },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl cursor-pointer hover:bg-muted/60 transition-colors" onClick={() => nav("certificate")}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center"><Award size={16} className="text-amber-500 dark:text-amber-400" /></div>
                    <div><p className="font-semibold text-foreground text-sm">{c.title}</p><p className="text-xs text-muted-foreground">{c.date}</p></div>
                  </div>
                  <Badge color="green">{c.score}%</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Resume Analyzer ──────────────────────────────────────────────────────────

function ResumeAnalyzerPage({ nav }: NavProps) {
  const [done, setDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState(0);

  const handleUpload = () => {
    setAnalyzing(true);
    setStep(0);
    const iv = setInterval(() => setStep((s) => { if (s >= 3) { clearInterval(iv); setAnalyzing(false); setDone(true); } return s + 1; }), 750);
  };

  const steps = ["Parsing document...", "Checking ATS compatibility...", "Analyzing keywords...", "Generating report..."];
  const skills = ["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "Docker", "REST APIs", "Agile", "Jest"];
  const missing = ["Kubernetes", "GraphQL", "AWS Lambda", "System Design", "Redis"];

  return (
    <DashboardLayout nav={nav} currentPage="resume">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Resume Analyzer</h1>
          <p className="text-muted-foreground text-sm mt-1">Upload your resume for AI-powered ATS analysis and improvement suggestions.</p>
        </div>
        {!done ? (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleUpload(); }}
            onClick={!analyzing ? handleUpload : undefined}
          >
            <Card className={cn("border-2 border-dashed p-16 text-center transition-all", dragging ? "border-indigo-500 bg-indigo-500/5" : "border-border hover:border-indigo-500/50 cursor-pointer")}>
              {analyzing ? (
                <div className="space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 flex items-center justify-center mx-auto">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <RefreshCw size={28} className="text-indigo-500" />
                    </motion.div>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-lg">Analyzing your resume...</p>
                    <p className="text-sm text-muted-foreground mt-1">Running ATS checks, keyword analysis, and grammar review</p>
                  </div>
                  <div className="space-y-2 max-w-xs mx-auto text-left">
                    {steps.slice(0, step + 1).map((s, i) => (
                      <motion.div key={s} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle size={14} className="text-emerald-500 shrink-0" />{s}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 flex items-center justify-center mx-auto">
                    <Upload size={28} className="text-indigo-500" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-xl">Drop your resume here</p>
                    <p className="text-sm text-muted-foreground mt-1">or click to browse · PDF, DOCX up to 10MB</p>
                  </div>
                  <Btn onClick={handleUpload}><Upload size={16} />Upload Resume</Btn>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <Card className="p-6 text-center">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">ATS Score</p>
                <div className="flex justify-center mb-4"><Ring value={87} size={120} stroke={10} label="87%" color="#6366f1" /></div>
                <Badge color="green">Excellent · Top 15%</Badge>
                <div className="mt-5 space-y-3">
                  {[["Format", 94, "#6366f1"], ["Keywords", 82, "#8b5cf6"], ["Grammar", 98, "#10b981"], ["Content", 81, "#f59e0b"]].map(([l, v, c]) => (
                    <div key={l as string}>
                      <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{l}</span><span className="font-semibold text-foreground">{v}%</span></div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full transition-all" style={{ width: `${v}%`, backgroundColor: c as string }} /></div>
                    </div>
                  ))}
                </div>
              </Card>
              <Btn className="w-full" variant="outline" onClick={() => setDone(false)}><Upload size={16} />Upload New Resume</Btn>
            </div>
            <div className="lg:col-span-2 space-y-4">
              <Card className="p-6">
                <h3 className="font-bold text-foreground mb-4">Detected Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle size={12} />{s}
                    </span>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold text-foreground mb-3">Missing Keywords</h3>
                <p className="text-xs text-muted-foreground mb-3">These skills appear in 70%+ of senior engineer postings:</p>
                <div className="flex flex-wrap gap-2">
                  {missing.map((s) => (
                    <span key={s} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-500 dark:text-red-400">
                      <XCircle size={12} />{s}
                    </span>
                  ))}
                </div>
              </Card>
              <Card className="p-6">
                <h3 className="font-bold text-foreground mb-4">AI Improvement Suggestions</h3>
                <div className="space-y-3">
                  {[
                    { t: "success", title: "Strong quantified impact", desc: "Your resume includes measurable achievements (40% revenue increase, 3× performance). Excellent signal for technical roles." },
                    { t: "warning", title: "Add cloud certifications", desc: "AWS or GCP certifications would boost your profile significantly — 78% of senior roles explicitly require cloud experience." },
                    { t: "info", title: "Highlight system design experience", desc: "Your system design experience isn't clearly visible. Add a dedicated Systems section or expand existing bullet points." },
                  ].map((s, i) => (
                    <div key={i} className={cn("flex gap-3 p-4 rounded-xl border", s.t === "success" ? "bg-emerald-500/8 border-emerald-500/20" : s.t === "warning" ? "bg-amber-500/8 border-amber-500/20" : "bg-indigo-500/8 border-indigo-500/20")}>
                      {s.t === "success" ? <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" /> : s.t === "warning" ? <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" /> : <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />}
                      <div>
                        <p className="font-semibold text-foreground text-sm">{s.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── AI Interview ─────────────────────────────────────────────────────────────

function InterviewPage({ nav }: NavProps) {
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [micOn, setMicOn] = useState(true);
  const [vidOn, setVidOn] = useState(true);
  const [thinking, setThinking] = useState(false);

  const questions = [
    "Tell me about yourself and your background in software engineering.",
    "Describe a challenging technical problem you solved and how you approached it.",
    "How do you handle disagreements with teammates or managers?",
    "Explain your experience with distributed systems and consistency challenges.",
    "Where do you see yourself in 5 years, and how does this role align with your goals?",
  ];

  useEffect(() => {
    if (!started || paused || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [started, paused, timeLeft]);

  const nextQ = () => {
    if (qIdx < questions.length - 1) {
      setThinking(true);
      setTimeout(() => { setThinking(false); setQIdx((i) => i + 1); setTimeLeft(120); }, 1800);
    } else nav("report");
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (!started) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/25">
            <Bot size={40} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">Ready for your interview?</h1>
            <p className="text-muted-foreground mt-2">5 questions · ~15 minutes · AI feedback included</p>
          </div>
          <Card className="p-6 text-left space-y-3">
            {["Ensure you&apos;re in a quiet environment", "Test your microphone and camera", "Have your resume ready for reference", "Speak clearly and at a comfortable pace"].map((tip, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                <CheckCircle size={16} className="text-emerald-500 shrink-0" />{tip}
              </div>
            ))}
          </Card>
          <div className="flex gap-3 justify-center">
            <Btn variant="secondary" onClick={() => nav("dashboard")}>Back</Btn>
            <Btn size="lg" onClick={() => setStarted(true)}><Play size={18} />Start Interview</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-bold text-foreground">AI Interview Session</span>
          <Badge color="green"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block mr-1" />Live</Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            {questions.map((_, i) => (<div key={i} className={cn("h-1.5 rounded-full transition-all", i < qIdx ? "w-6 bg-emerald-500" : i === qIdx ? "w-6 bg-indigo-500" : "w-4 bg-muted")} />))}
          </div>
          <span className="text-sm text-muted-foreground font-mono">{qIdx + 1}/{questions.length}</span>
          <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-mono font-bold", timeLeft < 30 ? "bg-red-500/15 text-red-500" : "bg-muted text-foreground")}>
            <Clock size={14} />{fmt(timeLeft)}
          </div>
          <Btn variant="danger" size="sm" onClick={() => nav("report")}><Square size={14} />End</Btn>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 overflow-hidden">
        <div className="col-span-1 flex flex-col gap-4 p-4 border-r border-border bg-muted/5">
          <div className="flex-1 bg-gradient-to-br from-indigo-950 to-violet-950 rounded-2xl border border-indigo-500/20 flex flex-col items-center justify-center relative overflow-hidden min-h-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(99,102,241,0.12),transparent_60%)]" />
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center z-10 mb-4 relative"
              animate={thinking ? { scale: [1, 1.04, 1] } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Bot size={44} className="text-white" />
              {!thinking && <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-indigo-950 flex items-center justify-center"><Volume2 size={10} className="text-white" /></div>}
            </motion.div>
            {thinking ? (
              <div className="z-10 flex items-center gap-2">
                <span className="text-indigo-300 text-sm">Thinking</span>
                {[0, 0.2, 0.4].map((d) => (<motion.div key={d} className="w-1.5 h-1.5 rounded-full bg-indigo-400" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: d }} />))}
              </div>
            ) : (
              <div className="z-10 flex gap-0.5">
                {[4, 7, 5, 9, 6, 8, 4, 7, 5].map((h, i) => (
                  <motion.div key={i} className="w-1 bg-indigo-400 rounded-full"
                    animate={{ height: [h * 2, h * 3.5, h * 2] }}
                    transition={{ duration: 0.5 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.08 }}
                    style={{ height: h * 2 }}
                  />
                ))}
              </div>
            )}
            <p className="absolute bottom-3 left-3 text-xs text-indigo-300 font-semibold">AI Interviewer</p>
          </div>

          <div className="h-36 bg-muted/30 rounded-2xl border border-border flex flex-col items-center justify-center relative shrink-0">
            {vidOn ? (
              <><div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center"><User size={22} className="text-white" /></div>
              <p className="text-xs text-muted-foreground mt-1.5">Alex Johnson</p></>
            ) : (
              <><VideoOff size={20} className="text-muted-foreground" /><p className="text-xs text-muted-foreground mt-1">Camera off</p></>
            )}
            <div className="absolute top-2 right-2">{micOn ? <Mic size={12} className="text-emerald-500" /> : <MicOff size={12} className="text-red-400" />}</div>
          </div>

          <div className="flex gap-2 justify-center shrink-0">
            {[
              { icon: micOn ? <Mic size={18} /> : <MicOff size={18} />, on: micOn, toggle: () => setMicOn(!micOn) },
              { icon: vidOn ? <Video size={18} /> : <VideoOff size={18} />, on: vidOn, toggle: () => setVidOn(!vidOn) },
              { icon: paused ? <Play size={18} /> : <Pause size={18} />, on: !paused, toggle: () => setPaused(!paused) },
            ].map((ctrl, i) => (
              <button key={i} onClick={ctrl.toggle}
                className={cn("p-3 rounded-xl transition-all", ctrl.on ? "bg-muted hover:bg-accent/60 text-foreground" : "bg-red-500/20 text-red-400 hover:bg-red-500/30")}>
                {ctrl.icon}
              </button>
            ))}
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-4 p-4 min-h-0">
          <Card className="p-5 shrink-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge color="blue">Question {qIdx + 1}</Badge>
                  <Badge color="purple">Behavioral</Badge>
                </div>
                <AnimatePresence mode="wait">
                  <motion.p key={qIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="text-foreground font-semibold text-lg leading-relaxed">
                    {thinking ? "..." : questions[qIdx]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <Btn onClick={nextQ} disabled={thinking}>
                {qIdx < questions.length - 1 ? <><ChevronRight size={16} />Next</> : <><Award size={16} />Finish</>}
              </Btn>
            </div>
          </Card>

          <Card className="flex-1 p-5 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className="font-bold text-foreground text-sm">Live Transcript</h3>
              <Badge color="green"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block mr-1" />Recording</Badge>
            </div>
            <div className="flex-1 overflow-auto space-y-4">
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0"><Bot size={14} className="text-indigo-400" /></div>
                <div className="bg-indigo-500/10 border border-indigo-500/15 rounded-2xl rounded-tl-none p-3 text-sm text-foreground max-w-[85%] leading-relaxed">{questions[qIdx]}</div>
              </div>
              {qIdx > 0 && (
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0"><User size={14} className="text-violet-400" /></div>
                  <div className="bg-violet-500/10 border border-violet-500/15 rounded-2xl rounded-tr-none p-3 text-sm text-foreground max-w-[85%] leading-relaxed">
                    During my previous role at TechCorp, we faced significant scalability challenges with our monolithic architecture. I proposed and led the migration to microservices, breaking the system into 12 independent services...
                  </div>
                </div>
              )}
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[["Pace", "Good", "text-emerald-500"], ["Filler Words", "2", "text-amber-500"], ["Clarity", "91%", "text-indigo-500"], ["Confidence", "High", "text-violet-500"]].map(([l, v, c]) => (
                  <div key={l} className="bg-muted/40 rounded-xl p-3 text-center">
                    <p className={cn("font-bold text-sm", c)}>{v}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Coding Page ──────────────────────────────────────────────────────────────

function CodingPage({ nav }: NavProps) {
  const [lang, setLang] = useState("JavaScript");
  const [panel, setPanel] = useState("testcases");
  const [ran, setRan] = useState(false);
  const code = `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }

  return [];
}`;

  const tests = [
    { input: "nums = [2,7,11,15], target = 9", expected: "[0,1]" },
    { input: "nums = [3,2,4], target = 6", expected: "[1,2]" },
    { input: "nums = [3,3], target = 6", expected: "[0,1]" },
    { input: "nums = [], target = 0", expected: "[]" },
  ];

  return (
    <DashboardLayout nav={nav} currentPage="coding">
      <div className="h-[calc(100vh-108px)] flex flex-col gap-4 min-h-0">
        <div className="flex items-start justify-between shrink-0">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-extrabold text-foreground">Two Sum</h1>
              <Badge color="green">Easy</Badge>
              <Badge color="blue">Arrays · Hash Map</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Given an array of integers and a target, return indices of the two numbers that add up to target.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <select value={lang} onChange={(e) => setLang(e.target.value)}
              className="bg-input-background border border-border rounded-xl px-3 py-2 text-sm text-foreground outline-none focus:border-indigo-500">
              {["JavaScript", "Python", "TypeScript", "Java", "C++", "Go"].map((l) => <option key={l}>{l}</option>)}
            </select>
            <Btn variant="outline" onClick={() => setRan(false)}><RotateCcw size={16} />Reset</Btn>
            <Btn variant="secondary" onClick={() => setRan(true)}><Play size={16} />Run</Btn>
            <Btn onClick={() => nav("report")}><CheckCircle size={16} />Submit</Btn>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
          <Card className="flex flex-col overflow-hidden min-h-0">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/20 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <div className="w-3 h-3 rounded-full bg-green-400/80" />
              <span className="text-xs text-muted-foreground ml-2 font-mono">solution.js</span>
            </div>
            <pre className="flex-1 p-4 text-[13px] font-mono text-foreground overflow-auto leading-[1.7] bg-muted/5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{code}</pre>
          </Card>

          <div className="flex flex-col gap-3 min-h-0">
            <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
              <div className="flex items-center gap-1 px-4 py-2.5 border-b border-border shrink-0">
                {["testcases", "console", "aireview"].map((t) => (
                  <button key={t} onClick={() => setPanel(t)}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize", panel === t ? "bg-indigo-500/15 text-indigo-500 dark:text-indigo-400" : "text-muted-foreground hover:text-foreground")}>
                    {t === "testcases" ? "Test Cases" : t === "aireview" ? "AI Review" : "Console"}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-auto p-4">
                {panel === "testcases" && (
                  <div className="space-y-3">
                    {tests.map((tc, i) => (
                      <div key={i} className={cn("p-3 rounded-xl border text-xs font-mono", ran ? (i === 3 ? "bg-red-500/8 border-red-500/20" : "bg-emerald-500/8 border-emerald-500/20") : "bg-muted/30 border-border")}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-muted-foreground font-sans font-semibold">Case {i + 1}</span>
                          {ran && (i === 3 ? <XCircle size={13} className="text-red-500" /> : <CheckCircle size={13} className="text-emerald-500" />)}
                        </div>
                        <p className="text-foreground">Input: {tc.input}</p>
                        <p className="text-foreground">Expected: {tc.expected}</p>
                      </div>
                    ))}
                  </div>
                )}
                {panel === "console" && (
                  <div className="font-mono text-sm space-y-1 leading-relaxed" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {ran ? (
                      <><p className="text-emerald-500">[0, 1]</p><p className="text-emerald-500">[1, 2]</p><p className="text-emerald-500">[0, 1]</p><p className="text-red-400">Edge case: empty array</p><p className="text-muted-foreground text-xs mt-3">Runtime: 72ms · Memory: 41.2MB</p></>
                    ) : <p className="text-muted-foreground text-sm">Run your code to see output...</p>}
                  </div>
                )}
                {panel === "aireview" && (
                  <div className="space-y-3">
                    {[
                      { t: "success", title: "Optimal complexity", desc: "O(n) time and space — the best solution for this problem." },
                      { t: "success", title: "Clean code", desc: "Good variable naming and clear structure. Easy for interviewers to follow." },
                      { t: "warning", title: "Missing edge case", desc: "Add guard: if (!nums.length) return []; — this handles the empty array case." },
                    ].map((r, i) => (
                      <div key={i} className={cn("flex gap-2 p-3 rounded-xl border", r.t === "success" ? "bg-emerald-500/8 border-emerald-500/20" : "bg-amber-500/8 border-amber-500/20")}>
                        {r.t === "success" ? <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" /> : <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />}
                        <div><p className="font-semibold text-foreground text-xs">{r.title}</p><p className="text-muted-foreground text-xs mt-0.5">{r.desc}</p></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
            {ran && (
              <Card className="p-4 grid grid-cols-3 gap-3 shrink-0">
                {[["Runtime", "72ms", "Beats 94%"], ["Memory", "41.2MB", "Beats 76%"], ["Status", "3/4", "Tests Passed"]].map(([l, v, sub]) => (
                  <div key={l} className="text-center">
                    <p className="text-xs text-muted-foreground">{l}</p>
                    <p className="font-extrabold text-foreground text-sm">{v}</p>
                    <p className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-0.5">{sub}</p>
                  </div>
                ))}
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Performance Report ───────────────────────────────────────────────────────

function ReportPage({ nav }: NavProps) {
  const scores = [
    { label: "Confidence", value: 87, color: "#6366f1" },
    { label: "Communication", value: 92, color: "#8b5cf6" },
    { label: "Technical", value: 79, color: "#06b6d4" },
    { label: "Coding", value: 83, color: "#10b981" },
    { label: "Behavior", value: 91, color: "#f59e0b" },
    { label: "Problem Solving", value: 85, color: "#ec4899" },
    { label: "Grammar", value: 94, color: "#3b82f6" },
  ];
  const radarData = scores.map((s) => ({ subject: s.label, A: s.value }));
  const timelineData = [
    { name: "Apr 2", score: 68 }, { name: "Apr 16", score: 73 }, { name: "May 4", score: 79 },
    { name: "May 18", score: 82 }, { name: "Jun 1", score: 84 }, { name: "Jun 28", score: 86 },
  ];

  return (
    <DashboardLayout nav={nav} currentPage="report">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Performance Report</h1>
            <p className="text-muted-foreground text-sm">Google SWE Interview Simulation · June 28, 2025</p>
          </div>
          <div className="flex gap-2">
            <Btn variant="outline" onClick={() => nav("certificate")}><Award size={16} />Get Certificate</Btn>
            <Btn><Download size={16} />Download PDF</Btn>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <Card className="md:col-span-1 p-6 text-center bg-gradient-to-br from-indigo-600/15 to-violet-600/8 border-indigo-500/25">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold mb-4">Overall Score</p>
            <div className="flex justify-center mb-3"><Ring value={86} size={100} stroke={10} label="86%" color="#6366f1" /></div>
            <Badge color="green">Top 12% of candidates</Badge>
            <p className="text-xs text-muted-foreground mt-2">vs 47,000+ interviews</p>
          </Card>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-3">
            {scores.slice(0, 4).map((s) => (
              <Card key={s.label} className="p-4 text-center">
                <div className="flex justify-center mb-2"><Ring value={s.value} size={60} stroke={6} color={s.color} /></div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-extrabold text-foreground text-sm mt-0.5">{s.value}%</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-bold text-foreground mb-4">Skill Breakdown</h3>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(99,102,241,0.15)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#8080a8", fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.22} strokeWidth={2} dot={{ fill: "#6366f1", r: 3 }} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-foreground mb-4">Score Progression</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,168,0.08)" />
                <XAxis dataKey="name" tick={{ fill: "#8080a8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fill: "#8080a8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }} />
                <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: "#6366f1", r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="font-bold text-foreground mb-4">AI Feedback</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { t: "success", title: "Excellent communication clarity", desc: "You maintained STAR format throughout with minimal filler words (avg. 2.1 per answer, vs. 5.8 average). Delivery was confident and measured." },
              { t: "success", title: "Strong technical depth", desc: "Your CAP theorem and distributed systems explanations demonstrated senior-level understanding. Trade-off articulation was particularly impressive." },
              { t: "warning", title: "Improve conciseness", desc: "Answers averaged 3.2 min vs. ideal 2 min. Practice STAR more tightly — you can deliver the same depth in less time with focused editing." },
              { t: "info", title: "Expand system design vocabulary", desc: "Load balancing and caching scenarios appeared in 60% of similar Google interview sessions. Consider adding these to your practice rotation." },
            ].map((f, i) => (
              <div key={i} className={cn("flex gap-3 p-4 rounded-xl border", f.t === "success" ? "bg-emerald-500/8 border-emerald-500/20" : f.t === "warning" ? "bg-amber-500/8 border-amber-500/20" : "bg-indigo-500/8 border-indigo-500/20")}>
                {f.t === "success" ? <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" /> : f.t === "warning" ? <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" /> : <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />}
                <div><p className="font-semibold text-foreground text-sm">{f.title}</p><p className="text-sm text-muted-foreground mt-0.5">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// ─── Certificate ──────────────────────────────────────────────────────────────

function CertificatePage({ nav }: NavProps) {
  return (
    <DashboardLayout nav={nav} currentPage="certificate">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Certificate of Achievement</h1>
            <p className="text-muted-foreground text-sm">Digital certificate — verifiable via QR code</p>
          </div>
          <div className="flex gap-2">
            <Btn variant="outline"><Share size={16} />Share on LinkedIn</Btn>
            <Btn><Download size={16} />Download PDF</Btn>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/25 via-violet-500/25 to-cyan-500/25 rounded-3xl blur-xl" />
          <div className="relative bg-gradient-to-br from-indigo-950 via-[#0d0d22] to-violet-950 border-2 border-indigo-500/30 rounded-2xl p-10 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-violet-500 to-indigo-500" />
            <div className="absolute inset-10 border border-indigo-500/12 rounded-xl pointer-events-none" />
            <div className="absolute top-4 left-4 w-14 h-14 border-t-2 border-l-2 border-indigo-500/40 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-14 h-14 border-t-2 border-r-2 border-indigo-500/40 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-14 h-14 border-b-2 border-l-2 border-indigo-500/40 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-14 h-14 border-b-2 border-r-2 border-indigo-500/40 rounded-br-lg" />

            <div className="relative text-center space-y-5">
              <div className="flex justify-center">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center">
                    <Brain size={24} className="text-white" />
                  </div>
                  <span className="text-white text-2xl font-extrabold">InterviewAI</span>
                </div>
              </div>

              <div>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-[0.35em] mb-2">Certificate of Achievement</p>
                <p className="text-indigo-200 text-sm">This certifies that</p>
              </div>

              <div>
                <h2 className="text-5xl font-extrabold text-white tracking-tight">Alex Johnson</h2>
                <div className="w-48 h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent mx-auto mt-2" />
              </div>

              <p className="text-indigo-200 text-sm">has successfully completed</p>

              <div className="py-4 px-8 bg-white/5 border border-indigo-500/20 rounded-xl inline-block">
                <h3 className="text-2xl font-extrabold text-white">Google SWE Interview Simulation</h3>
                <p className="text-indigo-300 text-sm mt-1">Technical &amp; Behavioral Assessment</p>
              </div>

              <div className="flex justify-center gap-10 py-3">
                {[["Overall Score", "86/100"], ["Percentile", "Top 12%"], ["Date", "June 28, 2025"]].map(([l, v]) => (
                  <div key={l} className="text-center">
                    <p className="text-3xl font-extrabold text-white">{v}</p>
                    <p className="text-indigo-300 text-[11px] uppercase tracking-widest mt-0.5">{l}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-end justify-between pt-4 border-t border-indigo-500/20">
                <div className="text-left">
                  <div className="text-white font-bold text-xl italic mb-1" style={{ fontFamily: "Georgia, serif" }}>InterviewAI Team</div>
                  <div className="w-36 h-px bg-indigo-400/50" />
                  <p className="text-indigo-300 text-xs mt-1">Digital Signature</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-1.5 mx-auto shadow-lg shadow-indigo-500/20">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center">
                      <QrCode size={26} className="text-white" />
                    </div>
                  </div>
                  <p className="text-indigo-300 text-[10px]">Scan to verify</p>
                  <p className="text-indigo-200 text-[10px] font-mono mt-0.5">IAI-2025-GGL-0847A</p>
                </div>
                <div className="text-right">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-2 ml-auto shadow-lg shadow-amber-500/30">
                    <Trophy size={28} className="text-white" />
                  </div>
                  <p className="text-amber-300 text-xs font-bold">Certified</p>
                  <p className="text-indigo-300 text-[10px]">June 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

function AdminPage({ nav, theme, setTheme }: NavProps) {
  const revData = [
    { m: "Jan", rev: 42, usr: 1200 }, { m: "Feb", rev: 48, usr: 1450 },
    { m: "Mar", rev: 51, usr: 1600 }, { m: "Apr", rev: 58, usr: 1900 },
    { m: "May", rev: 63, usr: 2100 }, { m: "Jun", rev: 72, usr: 2400 },
  ];
  const users = [
    { name: "Sarah Chen", email: "sarah@google.com", plan: "Pro", interviews: 23, score: 91, status: "active" },
    { name: "Marcus Johnson", email: "marcus@stripe.com", plan: "Pro", interviews: 18, score: 87, status: "active" },
    { name: "Priya Patel", email: "priya@meta.com", plan: "Starter", interviews: 5, score: 78, status: "active" },
    { name: "David Kim", email: "david@openai.com", plan: "Team", interviews: 41, score: 94, status: "active" },
    { name: "Emma Wilson", email: "emma@vercel.com", plan: "Pro", interviews: 12, score: 83, status: "inactive" },
  ];
  const pieData = [{ v: 52 }, { v: 38 }, { v: 10 }];

  return (
    <DashboardLayout nav={nav} theme={theme} setTheme={setTheme} currentPage="admin" isAdmin>
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Platform overview — July 1, 2025</p>
          </div>
          <div className="flex gap-2">
            <Btn variant="outline" size="sm"><RefreshCw size={14} />Refresh</Btn>
            <Btn size="sm"><Download size={14} />Export Report</Btn>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value="127,431" change="+2,341 this month" icon={<Users size={20} />} color="blue" />
          <StatCard label="Monthly Revenue" value="$72,000" change="+14.3% MoM" icon={<TrendingUp size={20} />} color="green" />
          <StatCard label="Active Interviews" value="4,291" change="+891 today" icon={<Bot size={20} />} color="purple" />
          <StatCard label="Certificates Issued" value="89,214" change="+1,204 this week" icon={<Award size={20} />} color="orange" />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">Revenue &amp; User Growth</h3>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-indigo-500 inline-block rounded-full" />Revenue ($k)</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-violet-500 inline-block rounded-full" />Users</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revData} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,168,0.08)" />
                <XAxis dataKey="m" tick={{ fill: "#8080a8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="l" tick={{ fill: "#8080a8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="r" orientation="right" tick={{ fill: "#8080a8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--foreground)" }} />
                <Bar yAxisId="l" dataKey="rev" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="r" dataKey="usr" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-6">
            <h3 className="font-bold text-foreground mb-4">Plan Distribution</h3>
            <ResponsiveContainer width="100%" height={160}>
              <RPieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="v">
                  {["#6366f1", "#8b5cf6", "#06b6d4"].map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px" }} />
              </RPieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {[["Pro", "52%", "#6366f1"], ["Starter", "38%", "#8b5cf6"], ["Team", "10%", "#06b6d4"]].map(([l, v, c]) => (
                <div key={l} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} /><span className="text-muted-foreground">{l}</span></div>
                  <span className="font-semibold text-foreground">{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-border flex-wrap gap-4">
            <h3 className="font-bold text-foreground">Recent Users</h3>
            <div className="flex gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input placeholder="Search users..." className="bg-input-background border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground outline-none focus:border-indigo-500 w-48" />
              </div>
              <Btn variant="outline" size="sm"><Filter size={14} />Filter</Btn>
              <Btn size="sm"><Plus size={14} />Add User</Btn>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["User", "Plan", "Interviews", "Avg Score", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u, i) => (
                  <tr key={i} className="hover:bg-muted/15 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div><p className="font-semibold text-foreground text-sm">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Badge color={u.plan === "Pro" ? "blue" : u.plan === "Team" ? "purple" : "default"}>{u.plan}</Badge></td>
                    <td className="px-6 py-4 text-sm text-foreground font-mono">{u.interviews}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-indigo-500 rounded-full" style={{ width: `${u.score}%` }} /></div>
                        <span className="text-sm text-foreground font-semibold">{u.score}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Badge color={u.status === "active" ? "green" : "default"}>{u.status}</Badge></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-accent/60 transition-colors"><Edit size={14} className="text-muted-foreground" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"><Trash size={14} className="text-muted-foreground hover:text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Showing 5 of 127,431 users</p>
            <div className="flex gap-1">
              {[1, 2, 3, "…", 100].map((p, i) => (
                <button key={i} className={cn("w-7 h-7 rounded-lg text-xs transition-colors", p === 1 ? "bg-indigo-600 text-white" : "text-muted-foreground hover:bg-accent/60")}>{p}</button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

function LeaderboardPage({ nav }: NavProps) {
  const leaders = [
    { rank: 1, name: "Yuki Tanaka", score: 98, interviews: 67, badge: "Diamond", flag: "🇯🇵" },
    { rank: 2, name: "Arnav Sharma", score: 96, interviews: 52, badge: "Diamond", flag: "🇮🇳" },
    { rank: 3, name: "Maria Gonzalez", score: 94, interviews: 48, badge: "Gold", flag: "🇲🇽" },
    { rank: 4, name: "Chen Wei", score: 93, interviews: 71, badge: "Gold", flag: "🇨🇳" },
    { rank: 5, name: "Alex Johnson", score: 91, interviews: 47, badge: "Gold", flag: "🇺🇸", you: true },
    { rank: 6, name: "Fatima Al-Hassan", score: 90, interviews: 38, badge: "Silver", flag: "🇸🇦" },
    { rank: 7, name: "Lucas Müller", score: 89, interviews: 44, badge: "Silver", flag: "🇩🇪" },
    { rank: 8, name: "Aisha Okafor", score: 88, interviews: 29, badge: "Silver", flag: "🇳🇬" },
  ];
  const bc: Record<string, string> = { Diamond: "text-cyan-500 bg-cyan-500/12", Gold: "text-amber-500 bg-amber-500/12", Silver: "text-slate-400 bg-slate-500/12" };
  const [top2, top1, top3] = [leaders[1], leaders[0], leaders[2]];
  const podium = [top2, top1, top3];
  const heights = ["h-28", "h-36", "h-24"];
  const ranks = [2, 1, 3];

  return (
    <DashboardLayout nav={nav} currentPage="leaderboard">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <Badge color="yellow"><Crown size={10} className="mr-1" />Global Rankings</Badge>
          <h1 className="text-3xl font-extrabold text-foreground mt-3">Leaderboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Top performers this month · 127,431 candidates ranked</p>
        </div>

        <div className="flex items-end justify-center gap-6 mt-4">
          {podium.map((l, i) => (
            <div key={l.name} className="flex flex-col items-center gap-2 w-28">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-extrabold">
                {l.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <p className="font-semibold text-foreground text-xs text-center leading-tight">{l.name}</p>
              <p className="text-xs text-muted-foreground">{l.score}%</p>
              <div className={cn("w-full rounded-t-xl flex flex-col items-center justify-end pb-3 border", heights[i],
                i === 1 ? "bg-gradient-to-t from-amber-600/20 to-amber-500/5 border-amber-500/20" :
                i === 0 ? "bg-gradient-to-t from-slate-600/20 to-slate-500/5 border-slate-500/20" :
                "bg-gradient-to-t from-orange-700/20 to-orange-600/5 border-orange-600/20")}>
                <span className="text-2xl font-extrabold text-foreground">#{ranks[i]}</span>
              </div>
            </div>
          ))}
        </div>

        <Card className="overflow-hidden">
          {leaders.map((l) => (
            <div key={l.name} className={cn("flex items-center gap-4 px-5 py-3.5 border-b border-border last:border-0 transition-colors", l.you ? "bg-indigo-500/5" : "hover:bg-muted/15")}>
              <span className={cn("font-mono font-extrabold text-sm w-6 text-center shrink-0", l.rank <= 3 ? "text-amber-500" : "text-muted-foreground")}>#{l.rank}</span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {l.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-foreground text-sm">{l.name}</p>
                  <span>{l.flag}</span>
                  {l.you && <Badge color="blue">You</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{l.interviews} interviews</p>
              </div>
              <span className={cn("px-2.5 py-1 rounded-lg text-xs font-bold shrink-0", bc[l.badge] || "")}>{l.badge}</span>
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${l.score}%` }} />
                </div>
                <span className="font-extrabold text-foreground text-sm w-12">{l.score}%</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </DashboardLayout>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────

function ProfilePage({ nav }: NavProps) {
  const [tab, setTab] = useState("overview");
  return (
    <DashboardLayout nav={nav} currentPage="profile">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6 bg-gradient-to-r from-indigo-950/80 to-violet-950/80 border-indigo-500/20">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-3xl font-extrabold shrink-0">AJ</div>
              <div>
                <h1 className="text-2xl font-extrabold text-foreground">Alex Johnson</h1>
                <p className="text-muted-foreground text-sm">Software Engineer · San Francisco, CA</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge color="blue">Pro Plan</Badge>
                  <Badge color="purple"><Crown size={9} className="mr-1" />Rank #5 Global</Badge>
                </div>
              </div>
            </div>
            <Btn variant="outline" size="sm" onClick={() => nav("settings")}><Edit size={14} />Edit Profile</Btn>
          </div>
          <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-500/20">
            {[["47", "Interviews"], ["86%", "Avg Score"], ["3", "Certificates"], ["Top 12%", "Percentile"]].map(([v, l]) => (
              <div key={l} className="text-center">
                <p className="text-2xl font-extrabold text-foreground">{v}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit">
          {["overview", "interviews", "certificates"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all", tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-4">Skills</h3>
              <div className="space-y-3">
                {[["React / TypeScript", 92], ["System Design", 79], ["Behavioral (STAR)", 91], ["Algorithm Design", 83], ["Communication", 94]].map(([l, v]) => (
                  <div key={l as string}>
                    <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{l}</span><span className="text-foreground font-semibold">{v}%</span></div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.8, delay: 0.1 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-4">Activity Heatmap</h3>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 49 }, (_, i) => {
                  const intensity = Math.random();
                  return (
                    <div key={i} className="aspect-square rounded-sm transition-transform hover:scale-110 cursor-pointer"
                      title={`${Math.round(intensity * 100)}% activity`}
                      style={{ backgroundColor: intensity > 0.7 ? "#6366f1" : intensity > 0.4 ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.05)" }}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-3">Daily practice over 7 weeks</p>
            </Card>
          </div>
        )}

        {tab === "interviews" && (
          <Card className="overflow-hidden">
            {[
              { title: "Google SWE Mock", type: "Technical", score: 86, date: "Jun 28", dur: "42 min" },
              { title: "Meta System Design", type: "System Design", score: 82, date: "Jun 22", dur: "55 min" },
              { title: "Amazon Behavioral", type: "Behavioral", score: 91, date: "Jun 15", dur: "38 min" },
              { title: "Stripe Coding Challenge", type: "Coding", score: 79, date: "Jun 8", dur: "60 min" },
            ].map((inv, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4 border-b border-border last:border-0 hover:bg-muted/15 cursor-pointer transition-colors" onClick={() => nav("report")}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 flex items-center justify-center"><Bot size={16} className="text-indigo-500 dark:text-indigo-400" /></div>
                  <div><p className="font-semibold text-foreground text-sm">{inv.title}</p><p className="text-xs text-muted-foreground">{inv.date} · {inv.dur}</p></div>
                </div>
                <div className="flex items-center gap-3"><Badge color="blue">{inv.type}</Badge><span className="font-extrabold text-foreground text-sm">{inv.score}%</span><ChevronRight size={16} className="text-muted-foreground" /></div>
              </div>
            ))}
          </Card>
        )}

        {tab === "certificates" && (
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Google SWE Prep", score: 86, date: "Jun 28, 2025", id: "IAI-0847A" },
              { title: "System Design Mastery", score: 87, date: "Jun 22, 2025", id: "IAI-0812B" },
              { title: "Behavioral Expert", score: 94, date: "Jun 15, 2025", id: "IAI-0793C" },
            ].map((c, i) => (
              <Card key={i} className="p-4 flex items-center gap-4 cursor-pointer hover:border-amber-500/30" onClick={() => nav("certificate")}>
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0"><Award size={22} className="text-amber-500" /></div>
                <div className="flex-1"><p className="font-semibold text-foreground text-sm">{c.title}</p><p className="text-xs text-muted-foreground">{c.date} · {c.id}</p></div>
                <Badge color="green">{c.score}%</Badge>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── Settings ─────────────────────────────────────────────────────────────────

function SettingsPage({ nav }: NavProps) {
  const [tab, setTab] = useState("account");
  const [notifs, setNotifs] = useState({ email: true, browser: false, weekly: true });
  return (
    <DashboardLayout nav={nav} currentPage="settings">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-extrabold text-foreground">Settings</h1>
        <div className="flex gap-1 bg-muted/40 p-1 rounded-xl w-fit">
          {["account", "notifications", "billing", "security"].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all", tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {t}
            </button>
          ))}
        </div>

        {tab === "account" && (
          <div className="space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-foreground">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Full name" value="Alex Johnson" icon={<User size={16} />} />
                <Field label="Email" type="email" value="alex@example.com" icon={<Mail size={16} />} />
                <Field label="Phone" value="+1 (555) 000-0000" icon={<Phone size={16} />} />
                <Field label="Location" value="San Francisco, CA" icon={<Globe size={16} />} />
              </div>
              <Btn>Save Changes</Btn>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-4">Profile Photo</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-extrabold">AJ</div>
                <div className="space-y-2">
                  <Btn variant="outline" size="sm"><Upload size={14} />Upload new photo</Btn>
                  <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === "notifications" && (
          <Card className="p-6 divide-y divide-border">
            <h3 className="font-bold text-foreground pb-4">Notification Preferences</h3>
            {[
              { key: "email" as const, label: "Email notifications", desc: "Receive interview reports and updates via email" },
              { key: "browser" as const, label: "Browser notifications", desc: "Push notifications for reminders and live alerts" },
              { key: "weekly" as const, label: "Weekly digest", desc: "Summary of your progress every Monday morning" },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between py-4">
                <div><p className="font-semibold text-foreground text-sm">{n.label}</p><p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p></div>
                <button onClick={() => setNotifs((p) => ({ ...p, [n.key]: !p[n.key] }))}
                  className={cn("w-11 h-6 rounded-full transition-all relative shrink-0", notifs[n.key] ? "bg-indigo-600" : "bg-muted")}>
                  <div className="absolute top-[3px] rounded-full bg-white shadow-sm transition-all" style={{ left: notifs[n.key] ? "22px" : "3px", width: "18px", height: "18px" }} />
                </button>
              </div>
            ))}
          </Card>
        )}

        {tab === "billing" && (
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div><h3 className="font-bold text-foreground">Pro Plan</h3><p className="text-sm text-muted-foreground mt-0.5">$29/month · Renews July 1, 2025</p></div>
                <Badge color="blue">Active</Badge>
              </div>
              <div className="flex gap-3">
                <Btn variant="outline" size="sm">Upgrade to Team</Btn>
                <Btn variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/8">Cancel Plan</Btn>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-bold text-foreground mb-4">Payment Method</h3>
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                <div className="w-10 h-7 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">VISA</span>
                </div>
                <div><p className="text-sm font-semibold text-foreground">•••• •••• •••• 4242</p><p className="text-xs text-muted-foreground">Expires 08/26</p></div>
                <Btn variant="ghost" size="sm" className="ml-auto">Update</Btn>
              </div>
            </Card>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-4">
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-foreground">Change Password</h3>
              <Field label="Current password" type="password" placeholder="Enter current password" icon={<Lock size={16} />} />
              <Field label="New password" type="password" placeholder="Min. 8 characters" icon={<Lock size={16} />} />
              <Field label="Confirm new password" type="password" placeholder="Confirm new password" icon={<Lock size={16} />} />
              <Btn>Update Password</Btn>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// ─── Roadmap Page ─────────────────────────────────────────────────────────────

function RoadmapPage({ nav }: NavProps) {
  const milestones = [
    { title: "Foundation: DS&A", status: "done", weeks: 2, topics: ["Arrays", "Hash Maps", "Linked Lists", "Trees"], score: 91 },
    { title: "System Design Basics", status: "done", weeks: 3, topics: ["CAP Theorem", "Load Balancing", "Caching", "Databases"], score: 87 },
    { title: "Behavioral Interview (STAR)", status: "active", weeks: 2, topics: ["Leadership", "Conflict Resolution", "Impact Stories", "Growth Mindset"], score: null },
    { title: "Advanced Algorithms", status: "locked", weeks: 3, topics: ["Graph Algorithms", "DP", "Sliding Window", "Binary Search"], score: null },
    { title: "Mock Interview Sprint", status: "locked", weeks: 2, topics: ["10 Full Interviews", "AI Feedback Review", "Score Optimization"], score: null },
  ];
  return (
    <DashboardLayout nav={nav} currentPage="roadmap">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Learning Roadmap</h1>
          <p className="text-muted-foreground text-sm mt-1">Your personalized 12-week interview preparation plan</p>
        </div>
        <Card className="p-6 bg-gradient-to-r from-indigo-600/15 to-violet-600/8 border-indigo-500/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Overall Progress</p>
              <p className="text-xs text-muted-foreground">Week 7 of 12 · 2 milestones completed</p>
            </div>
            <span className="text-2xl font-extrabold text-foreground">58%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: "58%" }} transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
          </div>
        </Card>
        <div className="space-y-4">
          {milestones.map((m, i) => (
            <motion.div key={m.title} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className={cn("p-5", m.status === "active" && "border-indigo-500/40", m.status === "locked" && "opacity-60")}>
                <div className="flex items-start gap-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2",
                    m.status === "done" ? "bg-emerald-500 border-emerald-400" : m.status === "active" ? "bg-indigo-600 border-indigo-400 ring-4 ring-indigo-500/20" : "bg-muted border-border")}>
                    {m.status === "done" ? <CheckCircle size={18} className="text-white" /> : m.status === "active" ? <Zap size={18} className="text-white" /> : <Lock size={16} className="text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h3 className="font-bold text-foreground">{m.title}</h3>
                      <div className="flex items-center gap-2">
                        <Badge color={m.status === "done" ? "green" : m.status === "active" ? "blue" : "default"}>
                          {m.status === "done" ? "Completed" : m.status === "active" ? "In Progress" : `${m.weeks}w`}
                        </Badge>
                        {m.score && <span className="font-extrabold text-foreground text-sm">{m.score}%</span>}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {m.topics.map((t) => (
                        <span key={t} className="px-2 py-0.5 bg-muted/60 rounded-md text-xs text-muted-foreground">{t}</span>
                      ))}
                    </div>
                    {m.status === "active" && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1"><span>Progress</span><span>60%</span></div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full w-[60%] bg-indigo-500 rounded-full" /></div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

// ─── Notifications Page ───────────────────────────────────────────────────────

function NotificationsPage({ nav }: NavProps) {
  const notifs = [
    { title: "Interview report ready", desc: "Your Google SWE Mock interview report is ready to review.", time: "5 min ago", type: "blue", unread: true },
    { title: "New badge earned", desc: "You earned the Speed Coder badge for completing 5 coding challenges in one day.", time: "1 hr ago", type: "purple", unread: true },
    { title: "Resume score improved", desc: "Your resume ATS score jumped from 75% to 87% after following our suggestions.", time: "3 hrs ago", type: "green", unread: false },
    { title: "Upcoming interview reminder", desc: "You have a scheduled AI interview in 24 hours: Meta System Design Round.", time: "Yesterday", type: "yellow", unread: false },
    { title: "Certificate ready", desc: "Your System Design Mastery certificate has been generated and is ready to download.", time: "2 days ago", type: "blue", unread: false },
  ];
  return (
    <DashboardLayout nav={nav} currentPage="notifications">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-foreground">Notifications</h1>
          <Btn variant="ghost" size="sm" className="text-indigo-500">Mark all read</Btn>
        </div>
        {notifs.map((n, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className={cn("p-5 flex items-start gap-4", n.unread && "border-indigo-500/30")}>
              <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 shrink-0", n.unread ? "bg-indigo-500" : "bg-transparent border border-muted-foreground/30")} />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="font-semibold text-foreground text-sm">{n.title}</p><p className="text-sm text-muted-foreground mt-0.5">{n.desc}</p></div>
                  <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const nav = (p: Page) => { setPage(p); window.scrollTo(0, 0); };

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>
      <AnimatePresence mode="wait">
        <motion.div key={page} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {page === "landing" && <LandingPage nav={nav} theme={theme} setTheme={setTheme} />}
          {page === "login" && <LoginPage nav={nav} />}
          {page === "register" && <RegisterPage nav={nav} />}
          {page === "forgot" && <ForgotPage nav={nav} />}
          {page === "dashboard" && <DashboardPage nav={nav} theme={theme} setTheme={setTheme} />}
          {page === "resume" && <ResumeAnalyzerPage nav={nav} />}
          {page === "interview" && <InterviewPage nav={nav} />}
          {page === "coding" && <CodingPage nav={nav} />}
          {page === "report" && <ReportPage nav={nav} />}
          {page === "certificate" && <CertificatePage nav={nav} />}
          {page === "admin" && <AdminPage nav={nav} theme={theme} setTheme={setTheme} />}
          {page === "leaderboard" && <LeaderboardPage nav={nav} />}
          {page === "profile" && <ProfilePage nav={nav} />}
          {page === "settings" && <SettingsPage nav={nav} />}
          {page === "notifications" && <NotificationsPage nav={nav} />}
          {page === "roadmap" && <RoadmapPage nav={nav} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
