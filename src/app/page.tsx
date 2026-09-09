"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { ReferenceBar } from "@/components/ReferenceBar";
import { DecToBinModule } from "@/components/modules/DecToBinModule";
import { BinToDecModule } from "@/components/modules/BinToDecModule";
import { SubnetModule } from "@/components/modules/SubnetModule";
import { ExplainerModule } from "@/components/modules/ExplainerModule";
import { useTheme } from "@/hooks/useTheme";
import { Binary, Network, Calculator, ArrowRightLeft } from "lucide-react";

type ModuleType = "dec2bin" | "bin2dec" | "subnet" | "explainer";

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleType>("dec2bin");
  const [streak, setStreak] = useState<number>(0);
  const { theme, toggleTheme } = useTheme();

  const handleStreakUpdate = (isCorrect: boolean) => {
    setStreak((prev) => (isCorrect ? prev + 1 : 0));
  };

  const navItems = [
    { id: "dec2bin", label: "Dez ➔ Bin", fullLabel: "Dezimal ➔ Binär", icon: Binary },
    { id: "bin2dec", label: "Bin ➔ Dez", fullLabel: "Binär ➔ Dezimal", icon: ArrowRightLeft },
    { id: "subnet", label: "Subnetz", fullLabel: "Subnetz & CIDR", icon: Network },
    { id: "explainer", label: "Rechner", fullLabel: "Rechenhelfer", icon: Calculator },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto w-full px-3 sm:px-6 py-3 sm:py-6 flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        streak={streak}
      />

      {/* Didaktischer Spickzettel (Mobile First als Akkordeon) */}
      <ReferenceBar />

      {/* Hauptnavigation / Modul-Tabs (Mobile-optimiert mit horizontalem Scroll-Snap) */}
      <nav className="relative mb-5 sm:mb-6">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none snap-x snap-mandatory -mx-3 px-3 sm:mx-0 sm:px-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id as ModuleType)}
                className={`snap-start flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? "bg-sky-600 dark:bg-sky-500 text-white border-sky-600 dark:border-sky-400 font-semibold shadow-md shadow-sky-600/20 dark:shadow-sky-500/25 scale-[1.02]"
                    : "border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]"
                }`}
              >
                <Icon size={16} className={isActive ? "text-white" : "text-sky-600 dark:text-sky-400"} />
                <span className="inline sm:hidden">{item.label}</span>
                <span className="hidden sm:inline">{item.fullLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Aktiver Modulinhalt */}
      <main className="flex-1">
        {activeModule === "dec2bin" && (
          <DecToBinModule onStreakUpdate={handleStreakUpdate} />
        )}
        {activeModule === "bin2dec" && (
          <BinToDecModule onStreakUpdate={handleStreakUpdate} />
        )}
        {activeModule === "subnet" && (
          <SubnetModule onStreakUpdate={handleStreakUpdate} />
        )}
        {activeModule === "explainer" && (
          <ExplainerModule />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 py-5 sm:py-6 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)] space-y-1.5">
        <p><strong>FiSi-Rechentrainer</strong> – Entwickelt als interaktive Lern- & Prüfungshilfe für die Fachinformatiker-Ausbildung (FiSi / IHK).</p>
        <p className="text-[11px] text-[var(--text-secondary)]">
          💡 Tastatur-Tipp: Drücke <kbd className="px-1.5 py-0.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] font-mono text-[10px] text-[var(--text-primary)]">Enter</kbd> zum schnellen Prüfen oder Weitergehen.
        </p>
      </footer>
    </div>
  );
}
