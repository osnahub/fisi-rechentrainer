"use client";

import React, { useState } from "react";
import { POWERS_OF_TWO_8BIT, SUBNET_TABLE } from "@/lib/subnetData";
import { ChevronDown, ChevronUp, Sparkles, Network } from "lucide-react";

interface ReferenceBarProps {
  onPlayClick?: () => void;
}

type TabType = "powers" | "subnet";

export function ReferenceBar({ onPlayClick }: ReferenceBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("powers");

  const toggleOpen = () => {
    onPlayClick?.();
    setIsOpen((prev) => !prev);
  };

  const handleTabChange = (tab: TabType) => {
    onPlayClick?.();
    setActiveTab(tab);
  };

  return (
    <aside className="my-3 sm:my-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm transition-all overflow-hidden">
      {/* Header / Accordion Trigger */}
      <button
        onClick={toggleOpen}
        type="button"
        className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2 text-left cursor-pointer hover:bg-[var(--bg-card-subtle)] transition-colors select-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Sparkles size={14} />
          </div>
          <span className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] truncate">
            Didaktischer Spickzettel
          </span>
          <span className="text-[10px] sm:text-xs text-[var(--text-muted)] font-normal hidden xs:inline truncate">
            (Zweierpotenzen & IPv4-Subnetzmasken)
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-medium text-sky-400">
            {isOpen ? "Ausblenden" : "Einblenden"}
          </span>
          <div className="w-6 h-6 rounded-lg border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)]">
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-3 sm:p-4 border-t border-[var(--border-color)] bg-[var(--bg-card-subtle)] animate-pop-in">
          {/* Tab Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] max-w-xs mx-auto mb-3.5">
            <button
              onClick={() => handleTabChange("powers")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === "powers"
                  ? "bg-sky-500 text-white font-semibold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Sparkles size={13} />
              <span>Zweierpotenzen</span>
            </button>
            <button
              onClick={() => handleTabChange("subnet")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === "subnet"
                  ? "bg-sky-500 text-white font-semibold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Network size={13} />
              <span>Subnetz / CIDR</span>
            </button>
          </div>

          {/* Tab 1: Zweierpotenzen (Mobile-optimiert als 2 Nibbles) */}
          {activeTab === "powers" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto font-mono text-xs">
                {/* High Nibble */}
                <div className="p-2.5 rounded-xl border border-sky-500/25 bg-[var(--bg-surface)]">
                  <span className="text-[11px] font-bold text-sky-400 block mb-1.5 uppercase tracking-wider">
                    High Nibble (Bits 7..4)
                  </span>
                  <div className="grid grid-cols-4 gap-1 text-center">
                    {POWERS_OF_TWO_8BIT.slice(0, 4).map((p) => (
                      <div
                        key={p.power}
                        className="p-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)]"
                      >
                        <div className="text-[10px] text-[var(--text-muted)]">2^{p.power}</div>
                        <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                          {p.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Nibble */}
                <div className="p-2.5 rounded-xl border border-indigo-500/25 bg-[var(--bg-surface)]">
                  <span className="text-[11px] font-bold text-indigo-400 block mb-1.5 uppercase tracking-wider">
                    Low Nibble (Bits 3..0)
                  </span>
                  <div className="grid grid-cols-4 gap-1 text-center">
                    {POWERS_OF_TWO_8BIT.slice(4, 8).map((p) => (
                      <div
                        key={p.power}
                        className="p-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)]"
                      >
                        <div className="text-[10px] text-[var(--text-muted)]">2^{p.power}</div>
                        <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                          {p.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-center text-[var(--text-muted)]">
                💡 Merkregel: Jede Stelle nach links verdoppelt ihren Wert (1, 2, 4, 8, 16, 32, 64, 128).
              </p>
            </div>
          )}

          {/* Tab 2: Subnetzmasken */}
          {activeTab === "subnet" && (
            <div className="overflow-x-auto">
              <table className="w-full text-center text-[11px] sm:text-xs font-mono border-collapse min-w-[320px]">
                <thead>
                  <tr className="text-[var(--text-muted)] border-b border-[var(--border-color)]">
                    <th className="py-1.5 px-1.5 text-left font-medium">CIDR</th>
                    <th className="py-1.5 px-1.5 font-medium text-sky-400">Masken-Oktett</th>
                    <th className="py-1.5 px-1.5 font-medium text-indigo-400">Schrittweite</th>
                    <th className="py-1.5 px-1.5 font-medium text-emerald-400">Nutzbar</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBNET_TABLE.map((row) => (
                    <tr
                      key={row.cidr}
                      className="border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-surface)] transition-colors"
                    >
                      <td className="py-1.5 px-1.5 text-left font-bold text-sky-400">{row.cidr}</td>
                      <td className="py-1.5 px-1.5 font-semibold">.{row.maskOctet}</td>
                      <td className="py-1.5 px-1.5 text-indigo-400 font-medium">{row.magicNumber}</td>
                      <td className="py-1.5 px-1.5 text-emerald-400 font-medium">{row.usableHosts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-[11px] text-center text-[var(--text-muted)] mt-2">
                💡 Magic Number Formel: <strong className="text-[var(--text-secondary)]">256 - Masken-Oktett = Schrittweite</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
