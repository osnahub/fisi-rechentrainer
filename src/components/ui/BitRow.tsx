"use client";

import React from "react";
import { RotateCcw, ArrowLeftRight, CheckCheck } from "lucide-react";

interface BitRowProps {
  bits: number[]; // e.g. [0, 1, 0, 1, ...]
  onChange: (newBits: number[]) => void;
  powers?: number[]; // e.g. [128, 64, 32, 16, 8, 4, 2, 1]
  showQuickActions?: boolean;
  showPowers?: boolean;
}

export function BitRow({
  bits,
  onChange,
  powers,
  showQuickActions = true,
  showPowers = true,
}: BitRowProps) {
  // Haptic is disabled by default to respect user comfort, only active if opted-in
  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        if (localStorage.getItem("fisi_haptics") === "true") {
          navigator.vibrate(10);
        }
      } catch {
        // Haptic feedback not supported or blocked
      }
    }
  };

  const toggleBit = (index: number) => {
    triggerHaptic();
    const next = [...bits];
    next[index] = next[index] === 1 ? 0 : 1;
    onChange(next);
  };

  const handleClearAll = () => {
    triggerHaptic();
    onChange(new Array(bits.length).fill(0));
  };

  const handleInvertAll = () => {
    triggerHaptic();
    onChange(bits.map((b) => (b === 1 ? 0 : 1)));
  };

  const handleSetAll = () => {
    triggerHaptic();
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
                    {/* Exponent & Stellenwert & MSB/LSB Badge (feste Höhe) */}
                    <div className="h-10 w-full flex flex-col items-center justify-end">
                      <div
                        className={`flex flex-col items-center justify-end transition-opacity duration-200 ${
                          showPowers
                            ? "opacity-100"
                            : "opacity-0 select-none pointer-events-none"
                        }`}
                      >
                        {isMSB && (
                          <span className="text-[10px] font-mono font-bold tracking-wider text-amber-900 bg-amber-200 border border-amber-400 dark:text-amber-200 dark:bg-amber-950 dark:border-amber-600 px-1 py-0.5 rounded leading-none mb-0.5">
                            MSB
                          </span>
                        )}
                        {isLSB && (
                          <span className="text-[10px] font-mono font-bold tracking-wider text-indigo-900 bg-indigo-200 border border-indigo-400 dark:text-indigo-200 dark:bg-indigo-950 dark:border-indigo-600 px-1 py-0.5 rounded leading-none mb-0.5">
                            LSB
                          </span>
                        )}
                        {!isMSB && !isLSB && (
                          <span className="text-[11px] font-mono text-[var(--text-muted)] font-medium leading-none mb-0.5">
                            {formatExponent(exponent)}
                          </span>
                        )}
                        <span
                          className={`text-xs font-mono transition-colors ${
                            isOn ? "text-sky-700 dark:text-sky-300 font-bold" : "text-[var(--text-muted)] font-medium"
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
                      aria-label={`Bit für Stellenwert ${powerVal} (2^${exponent}): ${isOn ? "1 (gesetzt)" : "0 (nicht gesetzt)"}`}
                      className={`w-[30px] h-11 xs:w-9 xs:h-12 sm:w-11 sm:h-14 rounded-xl font-mono text-base sm:text-xl font-bold border transition-all cursor-pointer select-none flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
                        isOn
                          ? "bg-sky-500/20 dark:bg-sky-500/25 border-sky-600 dark:border-sky-400 text-sky-800 dark:text-sky-200 font-extrabold shadow-sm scale-105"
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
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 text-xs text-[var(--text-secondary)]">
          <button
            type="button"
            onClick={handleClearAll}
            className="h-8 flex items-center justify-center gap-1 px-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            title="Alle Bits auf 0 setzen"
          >
            <RotateCcw size={12} />
            <span>Alles 0</span>
          </button>
          <button
            type="button"
            onClick={handleInvertAll}
            className="h-8 flex items-center justify-center gap-1 px-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            title="Alle Bits umkehren (0 ➔ 1, 1 ➔ 0)"
          >
            <ArrowLeftRight size={12} />
            <span>Invertieren</span>
          </button>
          <button
            type="button"
            onClick={handleSetAll}
            className="h-8 flex items-center justify-center gap-1 px-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-subtle)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
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
