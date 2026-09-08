"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { ReferenceBar } from "@/components/ReferenceBar";
import { DecToBinModule } from "@/components/modules/DecToBinModule";
import { BinToDecModule } from "@/components/modules/BinToDecModule";
import { HexModule } from "@/components/modules/HexModule";
import { SubnetModule } from "@/components/modules/SubnetModule";
import { ExplainerModule } from "@/components/modules/ExplainerModule";
import { SprintModule } from "@/components/modules/SprintModule";
import { useSound } from "@/hooks/useSound";
import { useTheme } from "@/hooks/useTheme";
import { Binary, Hash, Network, Calculator, Zap, ArrowRightLeft } from "lucide-react";

type ModuleType = "dec2bin" | "bin2dec" | "hex" | "subnet" | "explainer" | "sprint";

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleType>("dec2bin");
  const { enabled: soundEnabled, toggle: toggleSound, playClick, playSuccess, playError, playTrophy } = useSound();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: "dec2bin", label: "Dezimal ➔ Binär", icon: Binary },
    { id: "bin2dec", label: "Binär ➔ Dezimal", icon: ArrowRightLeft },
    { id: "hex", label: "0x HEX-Trainer", icon: Hash },
    { id: "subnet", label: "Subnetzmasken & CIDR", icon: Network },
    { id: "explainer", label: "Rechenhelfer", icon: Calculator },
    { id: "sprint", label: "Prüfungs-Sprint", icon: Zap },
  ] as const;

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 flex flex-col">
      {/* Header */}
      <Header
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          playClick();
          toggleSound();
        }}
        theme={theme}
        onToggleTheme={() => {
          playClick();
          toggleTheme();
        }}
      />

      {/* Didaktischer Spickzettel */}
      <ReferenceBar onPlayClick={playClick} />

      {/* Hauptnavigation / Modul-Tabs */}
      <nav className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-[var(--border-color)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playClick();
                setActiveModule(item.id as ModuleType);
              }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? "bg-sky-500 text-white border-sky-400 font-semibold shadow-md shadow-sky-500/20"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] hover:border-[var(--border-color)]"
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Aktiver Modulinhalt */}
      <main className="flex-1">
        {activeModule === "dec2bin" && (
          <DecToBinModule
            onSuccess={playSuccess}
            onError={playError}
            onPlayClick={playClick}
          />
        )}
        {activeModule === "bin2dec" && (
          <BinToDecModule
            onSuccess={playSuccess}
            onError={playError}
            onPlayClick={playClick}
          />
        )}
        {activeModule === "hex" && (
          <HexModule
            onSuccess={playSuccess}
            onError={playError}
            onPlayClick={playClick}
          />
        )}
        {activeModule === "subnet" && (
          <SubnetModule
            onSuccess={playSuccess}
            onError={playError}
            onPlayClick={playClick}
          />
        )}
        {activeModule === "explainer" && (
          <ExplainerModule onPlayClick={playClick} />
        )}
        {activeModule === "sprint" && (
          <SprintModule
            onSuccess={playSuccess}
            onError={playError}
            onPlayClick={playClick}
            onPlayTrophy={playTrophy}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)] space-y-1">
        <p>Entwickelt als interaktive Lern- und Prüfungshilfe für die Fachinformatiker-Ausbildung & Umschulung.</p>
        <p className="text-[11px] text-[var(--text-secondary)]">
          💡 Tipp: Drücke <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-card-subtle)] border border-[var(--border-color)] font-mono text-[10px]">Enter</kbd> zum schnellen Prüfen oder Weitergehen.
        </p>
      </footer>
    </div>
  );
}
