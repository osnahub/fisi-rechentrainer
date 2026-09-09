"use client";

import React from "react";
import { RotateCcw, ArrowLeftRight, CheckCheck } from "lucide-react";

interface BitRowProps {
  bits: number[]; // e.g. [0, 1, 0, 1, ...]
  onChange: (newBits: number[]) => void;
  onBitClick?: () => void;
  powers?: number[]; // e.g. [128, 64, 32, 16, 8, 4, 2, 1]
  showQuickActions?: boolean;
  showPowers?: boolean;
}

export function BitRow({
  bits,
  onChange,
  onBitClick,
  powers,
  showQuickActions = true,
  showPowers = true,
}: BitRowProps) {
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // Haptic feedback not supported or blocked
      }
    }
  };

  const toggleBit = (index: number) => {
    triggerHaptic();
    onBitClick?.();
    const next = [...bits];
    next[index] = next[index] === 1 ? 0 : 1;
    onChange(next);
  };

  const handleClearAll = () => {
    triggerHaptic();
    onBitClick?.();
    onChange(new Array(bits.length).fill(0));
  };

  const handleInvertAll = () => {
    triggerHaptic();
    onBitClick?.();
    onChange(bits.map((b) => (b === 1 ? 0 : 1)));
  };

  const handleSetAll = () => {
    triggerHaptic();
    onBitClick?.();
    onChange(new Array(bits.length).fill(1));
  };

  // Group into 4-bit nibbles for optimal readability and mobile sizing
  const chunkSize = 4;
  const nibbles: {
    bit: number;
    originalIndex: number;
    powerVal: number;
    exponent: number;
    isMSB: boolean;
    isLSB: boolean;
  }[][] = [];

  const SUPERSCRIPTS: Record<number, string> = {
    0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴",
    5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹",
  };

  const formatExponent = (exp: number) => {
    const s = String(exp);
    return "2" + s.split("").map((c) => SUPERSCRIPTS[Number(c)] ?? c).join("");
  };

  for (let i = 0; i < bits.length; i += chunkSize) {
    const chunk = bits.slice(i, i + chunkSize).map((bit, subIdx) => {
      const originalIndex = i + subIdx;
      const exponent = bits.length - 1 - originalIndex;
      const powerVal = powers ? powers[originalIndex] : Math.pow(2, exponent);
      const isMSB = originalIndex === 0;
      const isLSB = originalIndex === bits.length - 1;
      return { bit, originalIndex, powerVal, exponent, isMSB, isLSB };
    });
    nibbles.push(chunk);
  }

  return (
    <div className="w-full flex flex-col items-center my-3 sm:my-4">
      {/* Bit Container - Organized by Nibbles (Zero horizontal scroll needed on mobile) */}
      <div className="w-full max-w-xl flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-4 overflow-x-auto py-1 px-0.5 sm:px-1">
        {nibbles.map((nibble, nibbleIdx) => (
          <React.Fragment key={nibbleIdx}>
            <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 p-0.5 xs:p-1 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]/60">
              {nibble.map(({ bit, originalIndex, powerVal, exponent, isMSB, isLSB }) => {
                const isOn = bit === 1;

                return (
                  <div
                    key={originalIndex}
                    className="flex flex-col items-center gap-0.5 sm:gap-1 min-w-[30px] xs:min-w-[36px] sm:min-w-[44px]"
                  >
                    {/* Exponent & Stellenwert & MSB/LSB Badge (feste 36px Höhe) */}
                    <div className="h-9 w-full flex flex-col items-center justify-end">
                      <div
                        className={`flex flex-col items-center justify-end transition-opacity duration-200 ${
                          showPowers
                            ? "opacity-100"
                            : "opacity-0 select-none pointer-events-none"
                        }`}
                      >
                        {isMSB && (
                          <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-wider text-amber-800 bg-amber-100 border border-amber-300 dark:text-amber-300 dark:bg-amber-950/50 dark:border-amber-500/40 px-0.5 sm:px-1 py-0.5 rounded leading-none mb-0.5">
                            MSB
                          </span>
                        )}
                        {isLSB && (
                          <span className="text-[9px] sm:text-[10px] font-mono font-bold tracking-wider text-indigo-800 bg-indigo-100 border border-indigo-300 dark:text-indigo-300 dark:bg-indigo-950/50 dark:border-indigo-500/40 px-0.5 sm:px-1 py-0.5 rounded leading-none mb-0.5">
                            LSB
                          </span>
                        )}
                        {!isMSB && !isLSB && (
                          <span className="text-[9px] sm:text-[10px] font-mono text-[var(--text-muted)] font-medium leading-none mb-0.5">
                            {formatExponent(exponent)}
                          </span>
                        )}
                        <span
                          className={`text-[10px] sm:text-xs font-mono transition-colors ${
                            isOn ? "text-sky-600 dark:text-sky-400 font-bold" : "text-[var(--text-muted)] font-medium"
                          }`}
                          title={`Stellenwert 2^${exponent} = ${powerVal}`}
                        >
                          {powerVal}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleBit(originalIndex)}
                      aria-pressed={isOn}
                      aria-label={`Bit für Stellenwert ${powerVal} (2^${exponent}): ${isOn ? "gesetzt (1)" : "nicht gesetzt (0)"}`}
                      className={`w-[30px] h-11 xs:w-9 xs:h-12 sm:w-11 sm:h-14 rounded-xl font-mono text-base sm:text-xl font-bold border transition-all cursor-pointer select-none flex items-center justify-center ${
                        isOn
                          ? "bg-sky-500/15 dark:bg-sky-500/20 border-sky-500 dark:border-sky-400 text-sky-700 dark:text-sky-300 font-extrabold shadow-md shadow-sky-500/20 dark:shadow-sky-400/20 scale-105"
                          : "bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--bit-off-text)] font-semibold hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
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
