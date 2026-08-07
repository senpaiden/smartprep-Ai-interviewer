import React from 'react';

function cn(...cls: (string | false | null | undefined)[]): string {
  return cls.filter(Boolean).join(" ");
}

export function Card({
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
