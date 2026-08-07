import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function cn(...cls: (string | false | null | undefined)[]): string {
  return cls.filter(Boolean).join(" ");
}

export function Field({
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
            icon ? "pl-10" : "",
            type === "password" ? "pr-10" : "",
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
