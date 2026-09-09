"use client";

import React from "react";
import { RotateCcw, ArrowLeftRight, CheckCheck } from "lucide-react";

interface BitRowProps {
  bits: number[]; // e.g. [0, 1, 0, 1, ...]
  onChange: (newBits: number[]) => void;
  onBitClick?: () => void;
  powers?: number[]; // e.g. [128, 64, 32, 16, 8, 4, 2, 1]
  showQuickActions?: boolean;
}

export function BitRow({
  bits,
  onChange,
  onBitClick,
  powers,
  showQuickActions = true,
}: BitRowProps) {
  const toggleBit = (index: number) => {
    onBitClick?.();
    const next = [...bits];
    next[index] = next[index] === 1 ? 0 : 1;
    onChange(next);
  };

  const handleClearAll = () => {
    onBitClick?.();
    onChange(new Array(bits.length).fill(0));
  };

  const handleInvertAll = () => {
    onBitClick?.();
    onChange(bits.map((b) => (b === 1 ? 0 : 1)));
  };

  const handleSetAll = () => {
    onBitClick?.();
    onChange(new Array(bits.length).fill(1));
  };

  // Group into 4-bit nibbles for optimal readability and mobile sizing
  const chunkSize = 4;
  const nibbles: { bit: number; originalIndex: number; powerVal: number }[][] = [];

  for (let i = 0; i < bits.length; i += chunkSize) {
    const chunk = bits.slice(i, i + chunkSize).map((bit, subIdx) => {
      const originalIndex = i + subIdx;
      const powerVal = powers
        ? powers[originalIndex]
        : Math.pow(2, bits.length - 1 - originalIndex);
      return { bit, originalIndex, powerVal };
    });
    nibbles.push(chunk);
  }

  return (
    <div className="w-full flex flex-col items-center my-3 sm:my-4">
      {/* Bit Container - Organized by Nibbles */}
      <div className="w-full max-w-xl flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto py-1 px-1">
        {nibbles.map((nibble, nibbleIdx) => (
          <React.Fragment key={nibbleIdx}>
            <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]/60">
              {nibble.map(({ bit, originalIndex, powerVal }) => {
                const isOn = bit === 1;

                return (
                  <div
                    key={originalIndex}
                    className="flex flex-col items-center gap-1 min-w-[34px] sm:min-w-[44px]"
                  >
                    <span
                      className={`text-[10px] sm:text-xs font-mono transition-colors font-medium ${
                        isOn ? "text-sky-400 font-bold" : "text-[var(--text-muted)]"
                      }`}
                    >
                      {powerVal}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleBit(originalIndex)}
                      aria-pressed={isOn}
                      aria-label={`Bit für Stellenwert ${powerVal}: ${isOn ? "gesetzt (1)" : "nicht gesetzt (0)"}`}
                      className={`w-8.5 h-11 xs:w-9.5 xs:h-12 sm:w-11 sm:h-14 rounded-xl font-mono text-base sm:text-xl font-bold border transition-all cursor-pointer select-none flex items-center justify-center ${
                        isOn
                          ? "bg-[var(--bit-on-bg)] border-[var(--bit-on-border)] text-white shadow-md shadow-sky-500/30 scale-105"
                          : "bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--bit-off-text)] hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)]"
                      }`}
                    >
                      {bit}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Visual Nibble separator */}
            {nibbleIdx < nibbles.length - 1 && (
              <span
                className="hidden sm:inline-block font-mono text-xs text-[var(--text-muted)] select-none px-0.5"
                title="Nibble-Trenner"
              >
                •
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Quick Action Toolbar */}
      {showQuickActions && bits.length <= 16 && (
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 text-[11px] text-[var(--text-secondary)]">
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer"
            title="Alle Bits auf 0 setzen"
          >
            <RotateCcw size={12} />
            <span>Alles 0</span>
          </button>
          <button
            type="button"
            onClick={handleInvertAll}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer"
            title="Alle Bits umkehren (0 ➔ 1, 1 ➔ 0)"
          >
            <ArrowLeftRight size={12} />
            <span>Invertieren</span>
          </button>
          <button
            type="button"
            onClick={handleSetAll}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer"
            title="Alle Bits auf 1 setzen"
          >
            <CheckCheck size={12} />
            <span>Alles 1</span>
          </button>
        </div>
      )}
    </div>
  );
}
