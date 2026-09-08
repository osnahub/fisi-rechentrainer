"use client";

import React, { useState } from "react";
import { POWERS_OF_TWO_8BIT, SUBNET_TABLE, NIBBLE_TABLE } from "@/lib/subnetData";

interface ReferenceBarProps {
  onPlayClick?: () => void;
}

export function ReferenceBar({ onPlayClick }: ReferenceBarProps) {
  const [showSubnetDetails, setShowSubnetDetails] = useState(false);
  const [showNibbles, setShowNibbles] = useState(false);

  return (
    <aside className="my-5 p-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
        <span className="font-semibold text-sm flex items-center gap-1.5 text-[var(--text-primary)]">
          ⚡ Zweierpotenzen-Spickzettel <span className="text-xs text-[var(--text-muted)] font-normal">(8-Bit Oktett / IPv4)</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onPlayClick?.();
              setShowNibbles((prev) => !prev);
            }}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
              showNibbles
                ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
                : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
            }`}
          >
            🧩 Nibble-/Hex-Tabelle
          </button>
          <button
            onClick={() => {
              onPlayClick?.();
              setShowSubnetDetails((prev) => !prev);
            }}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
              showSubnetDetails
                ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
                : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
            }`}
          >
            {showSubnetDetails ? "Subnetz-Details ausblenden" : "Subnetz-Details einblenden"}
          </button>
        </div>
      </div>

      {/* Zweierpotenzen Tabelle */}
      <div className="overflow-x-auto mt-3">
        <table className="w-full text-center text-xs sm:text-sm font-mono border-collapse">
          <thead>
            <tr className="text-[var(--text-muted)] border-b border-[var(--border-color)]/60">
              <th className="py-1.5 px-2 text-left font-normal">Potenz</th>
              {POWERS_OF_TWO_8BIT.map((p) => (
                <th key={p.power} className="py-1.5 px-2 font-medium text-sky-400">
                  2<sup>{p.power}</sup>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[var(--border-color)]/40 font-semibold text-[var(--text-primary)]">
              <td className="py-2 px-2 text-left text-[var(--text-secondary)] font-normal">Wert</td>
              {POWERS_OF_TWO_8BIT.map((p) => (
                <td key={p.power} className="py-2 px-2">
                  {p.value}
                </td>
              ))}
            </tr>
            {showSubnetDetails && (
              <>
                <tr className="border-b border-[var(--border-color)]/40 text-emerald-400 font-medium">
                  <td className="py-2 px-2 text-left text-[var(--text-secondary)] font-normal">
                    Kumulativ (Maske)
                  </td>
                  <td>128</td>
                  <td>192</td>
                  <td>224</td>
                  <td>240</td>
                  <td>248</td>
                  <td>252</td>
                  <td>254</td>
                  <td>255</td>
                </tr>
                <tr className="text-indigo-400 font-medium">
                  <td className="py-2 px-2 text-left text-[var(--text-secondary)] font-normal">
                    CIDR (4. Oktett)
                  </td>
                  <td>/25</td>
                  <td>/26</td>
                  <td>/27</td>
                  <td>/28</td>
                  <td>/29</td>
                  <td>/30</td>
                  <td>/31</td>
                  <td>/32</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Ausklappbare Nibble Referenz */}
      {showNibbles && (
        <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-3">
            🧩 Das 4-Bit Nibble-Prinzip (0 bis 15 ➔ 0 bis F)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 font-mono text-xs">
            {NIBBLE_TABLE.map((n) => (
              <div
                key={n.hex}
                className="p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-subtle)] flex flex-col items-center gap-0.5"
              >
                <div className="font-bold text-sky-400 text-sm">0x{n.hex}</div>
                <div className="text-[var(--text-primary)] font-medium">{n.bin}</div>
                <div className="text-[var(--text-muted)] text-[10px]">Dez: {n.dec}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
