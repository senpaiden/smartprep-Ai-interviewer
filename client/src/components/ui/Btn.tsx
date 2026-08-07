import React from 'react';

function cn(...cls: (string | false | null | undefined)[]): string {
  return cls.filter(Boolean).join(" ");
}

export function Btn({
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
