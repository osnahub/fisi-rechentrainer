"use client";

import React, { useState } from "react";
import { POWERS_OF_TWO_8BIT, SUBNET_TABLE, NIBBLE_TABLE } from "@/lib/subnetData";
import { ChevronDown, ChevronUp, Sparkles, Network, Hexagon } from "lucide-react";
import { ModeTabs, TabItem } from "@/components/ui/ModeTabs";

type TabType = "powers" | "hex" | "subnet";

export function ReferenceBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("powers");

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const referenceTabs: TabItem<TabType>[] = [
    { id: "powers", label: "Zweierpotenzen", icon: Sparkles },
    { id: "hex", label: "Hex / Nibble", icon: Hexagon },
    { id: "subnet", label: "Subnetz / CIDR", icon: Network },
  ];

  return (
    <aside className="my-3 sm:my-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm transition-all overflow-hidden">
      {/* Header / Accordion Trigger */}
      <button
        id="reference-accordion-trigger"
        onClick={toggleOpen}
        type="button"
        aria-expanded={isOpen}
        aria-controls="reference-accordion-panel"
        className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2 text-left cursor-pointer hover:bg-[var(--bg-card-subtle)] transition-colors select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <Sparkles size={14} />
          </div>
          <span className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] truncate">
            Didaktischer Spickzettel
          </span>
          <span className="text-[11px] sm:text-xs text-[var(--text-muted)] font-normal hidden xs:inline truncate">
            (Zweierpotenzen, Hex-Nibbles &amp; IPv4-Subnetze)
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-sky-700 dark:text-sky-400">
            {isOpen ? "Ausblenden" : "Einblenden"}
          </span>
          <div className="w-6 h-6 rounded-lg border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)]">
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div
          id="reference-accordion-panel"
          role="region"
          aria-labelledby="reference-accordion-trigger"
          className="p-3 sm:p-4 border-t border-[var(--border-color)] bg-[var(--bg-card-subtle)] animate-pop-in"
        >
          {/* Tab Selector mit echtem WAI-ARIA Tab-Pattern */}
          <div className="max-w-sm mx-auto mb-3.5">
            <ModeTabs
              tabs={referenceTabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              ariaLabel="Spickzettel Themen"
              size="sm"
              idPrefix="reference"
              panelIdPrefix="reference-panel"
            />
          </div>

          {/* Tab 1: Zweierpotenzen */}
          <div
            role="tabpanel"
            id="reference-panel-powers"
            aria-labelledby="reference-tab-powers"
            hidden={activeTab !== "powers"}
            className={activeTab === "powers" ? "space-y-3" : "hidden"}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl mx-auto font-mono text-xs">
              {/* High Nibble */}
              <div className="p-2.5 rounded-xl border border-sky-500/25 bg-[var(--bg-surface)]">
                <span className="text-xs font-bold text-sky-700 dark:text-sky-400 block mb-1.5 uppercase tracking-wider">
                  High Nibble (Bits 7..4)
                </span>
                <div className="grid grid-cols-4 gap-1 text-center">
                  {POWERS_OF_TWO_8BIT.slice(0, 4).map((p) => (
                    <div
                      key={p.power}
                      className="p-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)]"
                    >
                      <div className="text-[11px] text-[var(--text-muted)]">2^{p.power}</div>
                      <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {p.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low Nibble */}
              <div className="p-2.5 rounded-xl border border-indigo-500/25 bg-[var(--bg-surface)]">
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 block mb-1.5 uppercase tracking-wider">
                  Low Nibble (Bits 3..0)
                </span>
                <div className="grid grid-cols-4 gap-1 text-center">
                  {POWERS_OF_TWO_8BIT.slice(4, 8).map((p) => (
                    <div
                      key={p.power}
                      className="p-1.5 rounded-lg bg-[var(--bg-card-subtle)] border border-[var(--border-color)]"
                    >
                      <div className="text-[11px] text-[var(--text-muted)]">2^{p.power}</div>
                      <div className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                        {p.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-[var(--text-muted)]">
              💡 Merkregel: Jede Stelle nach links verdoppelt ihren Wert (1, 2, 4, 8, 16, 32, 64, 128).
            </p>
          </div>

          {/* Tab 2: Hex / Nibbles (0–F) */}
          <div
            role="tabpanel"
            id="reference-panel-hex"
            aria-labelledby="reference-tab-hex"
            hidden={activeTab !== "hex"}
            className={activeTab === "hex" ? "space-y-3" : "hidden"}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs font-mono border-collapse min-w-[340px]">
                <caption className="sr-only">Hexadezimal- und Dualwerttabelle (0 bis F)</caption>
                <thead>
                  <tr className="text-[var(--text-muted)] border-b border-[var(--border-color)]">
                    <th scope="col" className="py-1.5 px-2 text-left font-medium">Hex</th>
                    {NIBBLE_TABLE.map((item) => (
                      <th scope="col" key={item.hex} className="py-1 px-1 text-sky-700 dark:text-sky-400 font-bold">
                        {item.hex}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--border-color)]/30">
                    <th scope="row" className="py-1.5 px-2 text-left font-semibold text-[var(--text-primary)]">Dez</th>
                    {NIBBLE_TABLE.map((item) => (
                      <td key={item.hex} className="py-1 px-1 text-[var(--text-secondary)]">
                        {item.dec}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-[var(--border-color)]/30">
                    <th scope="row" className="py-1.5 px-2 text-left font-semibold text-emerald-700 dark:text-emerald-400">Bin</th>
                    {NIBBLE_TABLE.map((item) => (
                      <td key={item.hex} className="py-1 px-0.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        {item.bin}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-center text-[var(--text-muted)]">
              💡 Jedes Byte (8 Bit) zerfällt in genau zwei 4-Bit-Nibbles: High-Nibble ($16^1$) und Low-Nibble ($16^0$).
            </p>
          </div>

          {/* Tab 3: Subnetzmasken */}
          <div
            role="tabpanel"
            id="reference-panel-subnet"
            aria-labelledby="reference-tab-subnet"
            hidden={activeTab !== "subnet"}
            className={activeTab === "subnet" ? "overflow-x-auto" : "hidden"}
          >
            <table className="w-full text-center text-xs font-mono border-collapse min-w-[320px]">
              <caption className="sr-only">Subnetzmasken im 4. Oktett Übersicht</caption>
              <thead>
                <tr className="text-[var(--text-muted)] border-b border-[var(--border-color)]">
                  <th scope="col" className="py-1.5 px-1.5 text-left font-medium">CIDR</th>
                  <th scope="col" className="py-1.5 px-1.5 font-medium text-sky-700 dark:text-sky-400">Masken-Oktett</th>
                  <th scope="col" className="py-1.5 px-1.5 font-medium text-indigo-700 dark:text-indigo-400">Schrittweite</th>
                  <th scope="col" className="py-1.5 px-1.5 font-medium text-emerald-700 dark:text-emerald-400">Nutzbar</th>
                </tr>
              </thead>
              <tbody>
                {SUBNET_TABLE.map((row) => (
                  <tr
                    key={row.cidr}
                    className="border-b border-[var(--border-color)]/30 hover:bg-[var(--bg-surface)] transition-colors"
                  >
                    <td className="py-1.5 px-1.5 text-left font-bold text-sky-700 dark:text-sky-400">{row.cidr}</td>
                    <td className="py-1.5 px-1.5 font-semibold text-[var(--text-primary)]">.{row.maskOctet}</td>
                    <td className="py-1.5 px-1.5 text-indigo-700 dark:text-indigo-400 font-medium">{row.magicNumber}</td>
                    <td className="py-1.5 px-1.5 text-emerald-700 dark:text-emerald-400 font-medium">{row.usableHosts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-center text-[var(--text-muted)] mt-2">
              💡 Magic Number Formel: <strong className="text-[var(--text-secondary)]">256 - Masken-Oktett = Schrittweite</strong>
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}
