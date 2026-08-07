import React from 'react';

function cn(...cls: (string | false | null | undefined)[]): string {
  return cls.filter(Boolean).join(" ");
}

export function Badge({
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
