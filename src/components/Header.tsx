"use client";

import React from "react";
import { Volume2, VolumeX, Sun, Moon } from "lucide-react";

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Header({
  soundEnabled,
  onToggleSound,
  theme,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 py-4 border-b border-[var(--border-color)]">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-500 flex items-center justify-center font-mono font-bold text-white shadow-lg shadow-sky-500/20 text-sm">
          0x01
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            FiSi-Dec-Bin-Hex-Trainer
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Binär-, Dezimal- & Hex-Trainer für Fachinformatiker Systemintegration
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSound}
          className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer"
          title={soundEnabled ? "Ton ausschalten" : "Ton einschalten"}
          aria-label="Ton an oder aus"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer"
          title={theme === "dark" ? "Helles Design aktivieren" : "Dunkles Design aktivieren"}
          aria-label="Design umschalten"
        >
          {theme === "dark" ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-sky-600" />}
        </button>
      </div>
    </header>
  );
}
