import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card } from './Card';

function cn(...cls: (string | false | null | undefined)[]): string {
  return cls.filter(Boolean).join(" ");
}

export function StatCard({ label, value, change, icon, color = "blue" }: {
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
