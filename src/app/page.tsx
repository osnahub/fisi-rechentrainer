"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { Header } from "@/components/Header";
import { ReferenceBar } from "@/components/ReferenceBar";
import { DecToBinModule } from "@/components/modules/DecToBinModule";
import { BinToDecModule } from "@/components/modules/BinToDecModule";
import { HexModule, HexSubMode } from "@/components/modules/HexModule";
import { SubnetModule, SubnetTaskType } from "@/components/modules/SubnetModule";
import { ExplainerModule } from "@/components/modules/ExplainerModule";
import { useTheme } from "@/hooks/useTheme";
import { ModeTabs, TabItem } from "@/components/ui/ModeTabs";
import { Binary, Network, Calculator, ArrowRightLeft, Hexagon } from "lucide-react";

type ModuleType = "dec2bin" | "bin2dec" | "hex" | "subnet" | "explainer";

const VALID_MODULES: ModuleType[] = ["dec2bin", "bin2dec", "hex", "subnet", "explainer"];

function TrainerContent() {
  const [activeModule, setActiveModule] = useState<ModuleType>("dec2bin");
  const [hexSubMode, setHexSubMode] = useState<HexSubMode>("bin2hex");
  const [subnetTaskType, setSubnetTaskType] = useState<SubnetTaskType>("cidr2mask");
  const [streak, setStreak] = useState<number>(0);
  const { theme, toggleTheme } = useTheme();

  // Read URL params on initial mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const mod = params.get("module") as ModuleType | null;
      if (mod && VALID_MODULES.includes(mod)) {
        setActiveModule(mod);
      }
      const sub = params.get("sub");
      if (sub) {
        if (["bin2hex", "hex2bin", "dec2hex", "hex2dec"].includes(sub)) {
          setHexSubMode(sub as HexSubMode);
        }
        if (["cidr2mask", "mask2bin", "magicNumber"].includes(sub)) {
          setSubnetTaskType(sub as SubnetTaskType);
        }
      }
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  // Update URL without reloading or resetting state
  const updateUrl = useCallback((mod: ModuleType, sub?: string) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("module", mod);
    if (sub) {
      url.searchParams.set("sub", sub);
    } else {
      url.searchParams.delete("sub");
    }
    window.history.pushState(null, "", url.toString());
  }, []);

  const handleModuleChange = (mod: ModuleType) => {
    setActiveModule(mod);
    let sub: string | undefined;
    if (mod === "hex") sub = hexSubMode;
    if (mod === "subnet") sub = subnetTaskType;
    updateUrl(mod, sub);
  };

  const handleHexSubModeChange = (mode: HexSubMode) => {
    setHexSubMode(mode);
    updateUrl("hex", mode);
  };

  const handleSubnetTaskTypeChange = (type: SubnetTaskType) => {
    setSubnetTaskType(type);
    updateUrl("subnet", type);
  };

  const handleStreakUpdate = (isCorrect: boolean) => {
    setStreak((prev) => (isCorrect ? prev + 1 : 0));
  };

  const navItems: TabItem<ModuleType>[] = [
    { id: "dec2bin", label: "Dez ➔ Bin", fullLabel: "Dezimal ➔ Binär", icon: Binary },
    { id: "bin2dec", label: "Bin ➔ Dez", fullLabel: "Binär ➔ Dezimal", icon: ArrowRightLeft },
    { id: "hex", label: "0x Hex", fullLabel: "Hexadezimal", icon: Hexagon },
    { id: "subnet", label: "Subnetz", fullLabel: "Subnetz & CIDR", icon: Network },
    { id: "explainer", label: "Rechner", fullLabel: "Rechenhelfer", icon: Calculator },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full px-3 sm:px-6 py-3 sm:py-6 flex-1 flex flex-col min-h-screen">
      {/* Skip-Link für Barrierefreiheit */}
      <a
        href="#main-content"
        onClick={(e) => {
          const target = document.getElementById("main-content");
          if (target) {
            target.focus();
          }
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:rounded-xl focus:bg-sky-700 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white font-medium text-xs sm:text-sm"
      >
        Zum Hauptinhalt springen
      </a>

      {/* Header */}
      <Header theme={theme} onToggleTheme={toggleTheme} streak={streak} />

      {/* Didaktischer Spickzettel */}
      <ReferenceBar />

      {/* Hauptnavigation / Modul-Tabs */}
      <nav className="relative mb-5 sm:mb-6" aria-label="Hauptnavigation">
        <ModeTabs
          tabs={navItems}
          activeTab={activeModule}
          onChange={handleModuleChange}
          ariaLabel="Lernmodule"
          size="md"
          panelIdPrefix="panel"
        />
      </nav>

      {/* Aktiver Modulinhalt */}
      <main id="main-content" tabIndex={-1} className="flex-1 outline-none">
        {activeModule === "dec2bin" && (
          <div role="tabpanel" id="panel-dec2bin" aria-labelledby="tab-dec2bin">
            <DecToBinModule onStreakUpdate={handleStreakUpdate} />
          </div>
        )}
        {activeModule === "bin2dec" && (
          <div role="tabpanel" id="panel-bin2dec" aria-labelledby="tab-bin2dec">
            <BinToDecModule onStreakUpdate={handleStreakUpdate} />
          </div>
        )}
        {activeModule === "hex" && (
          <div role="tabpanel" id="panel-hex" aria-labelledby="tab-hex">
            <HexModule
              onStreakUpdate={handleStreakUpdate}
              subMode={hexSubMode}
              onSubModeChange={handleHexSubModeChange}
            />
          </div>
        )}
        {activeModule === "subnet" && (
          <div role="tabpanel" id="panel-subnet" aria-labelledby="tab-subnet">
            <SubnetModule
              onStreakUpdate={handleStreakUpdate}
              taskType={subnetTaskType}
              onTaskTypeChange={handleSubnetTaskTypeChange}
            />
          </div>
        )}
        {activeModule === "explainer" && (
          <div role="tabpanel" id="panel-explainer" aria-labelledby="tab-explainer">
            <ExplainerModule />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 py-5 sm:py-6 border-t border-[var(--border-color)] text-center text-xs text-[var(--text-muted)] space-y-1.5">
        <p>
          <strong>FiSi-Rechentrainer</strong> – Entwickelt als interaktive Lern- &amp; Prüfungshilfe für die Fachinformatiker-Ausbildung (FiSi / IHK).
        </p>
        <p className="text-xs text-[var(--text-secondary)]">
          💡 Tastatur-Tipp: Drücke <kbd className="px-1.5 py-0.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)] font-mono text-[11px] text-[var(--text-primary)]">Enter</kbd> zum Prüfen und nach korrekter Lösung zum direkten Weiterspringen zur nächsten Aufgabe.
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-sm font-mono">Lade FiSi-Rechentrainer...</div>}>
      <TrainerContent />
    </Suspense>
  );
}
