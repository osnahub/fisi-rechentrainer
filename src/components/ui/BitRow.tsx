"use client";

import React from "react";

interface BitRowProps {
  bits: number[]; // e.g. [0, 1, 0, 1, ...]
  onChange: (newBits: number[]) => void;
  onBitClick?: () => void;
  powers?: number[]; // e.g. [128, 64, 32, 16, 8, 4, 2, 1]
}

export function BitRow({ bits, onChange, onBitClick, powers }: BitRowProps) {
  const toggleBit = (index: number) => {
    onBitClick?.();
    const next = [...bits];
    next[index] = next[index] === 1 ? 0 : 1;
    onChange(next);
  };

  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 my-4">
      {bits.map((bit, idx) => {
        const powerVal = powers ? powers[idx] : Math.pow(2, bits.length - 1 - idx);
        const isOn = bit === 1;

        return (
          <div key={idx} className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-mono text-[var(--text-muted)]">
              {powerVal}
            </span>
            <button
              type="button"
              onClick={() => toggleBit(idx)}
              className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl font-mono text-lg sm:text-xl font-bold border transition-all cursor-pointer select-none flex items-center justify-center ${
                isOn
                  ? "bg-sky-600 border-sky-400 text-white shadow-md shadow-sky-500/30 scale-105"
                  : "bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-muted)] hover:border-[var(--border-hover)]"
              }`}
              aria-label={`Bit für Wert ${powerVal}: aktuell ${bit}`}
            >
              {bit}
            </button>
          </div>
        );
      })}
    </div>
  );
}
