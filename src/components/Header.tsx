"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";

interface HeaderProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Header({
  theme,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-3 py-3 sm:py-4 border-b border-[var(--border-color)]">
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-cyan-400 flex items-center justify-center font-mono font-bold text-white shadow-lg shadow-sky-500/25 text-xs sm:text-sm shrink-0">
          FiSi
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-[var(--text-primary)] truncate">
              FiSi-Rechentrainer
            </h1>
          </div>
          <p className="text-[10.5px] sm:text-xs text-[var(--text-secondary)] truncate">
            <span className="hidden sm:inline">Der interaktive </span>Zahlensystem- &amp; Subnetz-Trainer<span className="hidden sm:inline"> für Fachinformatiker</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <button
          onClick={onToggleTheme}
          className="w-10 h-10 sm:w-10.5 sm:h-10.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer flex items-center justify-center"
          title={theme === "dark" ? "Helles Design aktivieren" : "Dunkles Design aktivieren"}
          aria-label={theme === "dark" ? "Helles Design aktivieren" : "Dunkles Design aktivieren"}
        >
          {theme === "dark" ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-sky-600" />
          )}
        </button>
      </div>
    </header>
  );
}
