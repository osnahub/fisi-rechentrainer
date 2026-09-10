"use client";

import React, { useState } from "react";
import { Conversions } from "@/lib/conversions";
import { Sparkles } from "lucide-react";
import { useExerciseState } from "@/hooks/useExerciseState";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { ExerciseActions } from "@/components/ui/ExerciseActions";

interface BinToDecModuleProps {
  rng?: () => number;
}

export function BinToDecModule({ rng }: BinToDecModuleProps) {
  const [showPowersHelper, setShowPowersHelper] = useState<boolean>(true);

  const exercise = useExerciseState<string>({
    generator: (prev, customRng) => {
      const getR = customRng || rng || Math.random;
      let val = Math.floor(getR() * 256);
      let bin = Conversions.decToBin(val, 8);
      while (bin === prev) {
        val = Math.floor(getR() * 256);
        bin = Conversions.decToBin(val, 8);
      }
      return bin;
    },
    validator: (input, target) => {
      const parsed = Conversions.parseDecimalInput(input);
      if (!parsed.ok) return false;
      return parsed.value === Conversions.binToDec(target);
    },
    getSuccessMessage: (target) => {
      const targetDec = Conversions.binToDec(target);
      return `Richtig! ${Conversions.formatNibbles(target)}₂ entspricht exakt ${targetDec}₁₀.`;
    },
    getErrorMessage: (target, input) => {
      const parsed = Conversions.parseDecimalInput(input);
      if (!parsed.ok) {
        return "Bitte eine gültige positive Dezimalzahl (0–255) eingeben.";
      }
      const targetDec = Conversions.binToDec(target);
      const diff = parsed.value - targetDec;
      return `Leider falsch: Deine Eingabe war ${parsed.value} (Differenz: ${diff > 0 ? "+" : ""}${diff}).`;
    },
    rng,
  });

  const targetBinary = exercise.target;
  const targetDec = Conversions.binToDec(targetBinary);
  const bitArray = targetBinary.split("").map(Number);

  // Group bit display into 4-bit nibbles
  const chunkSize = 4;
  const SUPERSCRIPTS: Record<number, string> = {
    0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴",
    5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹",
  };
  const formatExponent = (exp: number) => {
    const s = String(exp);
    return "2" + s.split("").map((c) => SUPERSCRIPTS[Number(c)] ?? c).join("");
  };

  const nibbles: {
    bit: number;
    powerVal: number;
    exponent: number;
    isOn: boolean;
    originalIndex: number;
    isMSB: boolean;
    isLSB: boolean;
  }[][] = [];

  for (let i = 0; i < bitArray.length; i += chunkSize) {
    const chunk = bitArray.slice(i, i + chunkSize).map((bit, subIdx) => {
      const originalIndex = i + subIdx;
      const exponent = bitArray.length - 1 - originalIndex;
      return {
        bit,
        powerVal: Math.pow(2, exponent),
        exponent,
        isOn: bit === 1,
        originalIndex,
        isMSB: originalIndex === 0,
        isLSB: originalIndex === bitArray.length - 1,
      };
    });
    nibbles.push(chunk);
  }

  const polynomialTerms = Conversions.getPolynomialExpansion(targetBinary);
  const activePowers = polynomialTerms.filter((t) => t.isActive);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Steuerungsleiste */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs px-2.5 sm:px-3 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300 font-mono font-semibold">
            8-Bit (1 Byte · Bereich 0 bis 255)
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowPowersHelper((prev) => !prev)}
          className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
            showPowersHelper
              ? "bg-[var(--primary-btn-bg)] text-white border-[var(--primary-btn-bg)] font-semibold shadow-sm"
              : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
          }`}
        >
          <span>Stellenwerte {showPowersHelper ? "an" : "aus"}</span>
          <span>💡</span>
        </button>
      </div>

      {/* Aufgaben-Karte */}
      <div className="p-3.5 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center shadow-sm relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={13} />
          <span>Aufgabe</span>
        </div>

        <h2 className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
          Wandle dieses Bitmuster in die Dezimalzahl um:
        </h2>

        {/* Visuelle Bit-Anzeige nach 4er-Nibbles gegliedert */}
        <div className="w-full max-w-xl mx-auto flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-4 overflow-x-auto my-4 sm:my-7 py-1 px-0.5 sm:px-1">
          {nibbles.map((nibble, nIdx) => (
            <React.Fragment key={nIdx}>
              <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 p-0.5 xs:p-1 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]/60">
                {nibble.map(({ bit, powerVal, exponent, isOn, originalIndex, isMSB, isLSB }) => (
                  <div
                    key={originalIndex}
                    className="flex flex-col items-center gap-0.5 sm:gap-1 min-w-[30px] xs:min-w-[36px] sm:min-w-[44px]"
                  >
                    <div className="h-10 w-full flex flex-col items-center justify-end">
                      <div
                        className={`flex flex-col items-center justify-end transition-opacity duration-200 ${
                          showPowersHelper
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
                          className={`text-xs font-mono ${
                            isOn
                              ? "text-sky-700 dark:text-sky-300 font-bold"
                              : "text-[var(--text-muted)] font-medium"
                          }`}
                        >
                          {powerVal}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-[30px] h-11 xs:w-9 xs:h-12 sm:w-11 sm:h-14 rounded-xl font-mono text-base sm:text-xl font-bold border flex items-center justify-center select-none transition-all ${
                        isOn
                          ? "bg-sky-500/20 dark:bg-sky-500/25 border-sky-600 dark:border-sky-400 text-sky-800 dark:text-sky-200 font-extrabold shadow-sm scale-105"
                          : "bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--bit-off-text)] font-semibold"
                      }`}
                    >
                      {bit}
                    </div>
                  </div>
                ))}
              </div>

              {nIdx < nibbles.length - 1 && (
                <span className="hidden sm:inline-block font-mono text-xs text-[var(--text-muted)] select-none px-0.5">
                  •
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Eingabefeld mit sichtbarem Label */}
        <div className="max-w-xs mx-auto my-4 sm:my-6">
          <label htmlFor="bin2dec-input" className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            Dezimalwert eingeben:
          </label>
          <input
            id="bin2dec-input"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            spellCheck="false"
            value={exercise.userInput}
            onChange={(e) => exercise.setUserInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 3))}
            onKeyDown={exercise.handleKeyDown}
            placeholder="z. B. 173"
            aria-describedby="bin2dec-hint"
            className="w-full text-center font-mono text-2xl sm:text-3xl py-3 px-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
          <p id="bin2dec-hint" className="text-[11px] text-[var(--text-muted)] mt-2">
            Addiere die aktiven Zweierpotenzen (nur 1-Bits). Mit Enter bestätigen.
          </p>
        </div>

        {/* Aktionsleiste */}
        <ExerciseActions
          isCompleted={exercise.isCompleted}
          onCheck={exercise.checkAnswer}
          onNext={exercise.nextTask}
          onRevealSolution={exercise.revealSolution}
        />

        {/* Barrierefreies Feedback */}
        <FeedbackMessage feedback={exercise.feedback} />
      </div>

      {/* Didaktischer Lösungsweg mit Polynomdarstellung */}
      {(exercise.solutionRevealed || exercise.status === "revealed") && (
        <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] animate-pop-in space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 flex items-center justify-center text-xs">📖</span>
            <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
              Mathematische Herleitung (Polynomdarstellung):
            </h3>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-mono">
            <div className="text-[var(--text-muted)] text-[11px] mb-1">Stellenwert-Definition im Zweiersystem:</div>
            <div className="text-sky-700 dark:text-sky-400 font-bold sm:text-sm">
              N₁₀ = ∑ (bᵢ · 2ⁱ) = (b_{bitArray.length - 1} · 2^{bitArray.length - 1}) + … + (b₀ · 2⁰)
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-xs text-[var(--text-secondary)] font-medium">
              Eingesetzte Bitwerte &amp; Potenzen:
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] font-mono text-xs flex flex-wrap items-center gap-1.5 leading-relaxed">
              {polynomialTerms.map((term, i) => (
                <React.Fragment key={term.power}>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded-md border ${
                      term.isActive
                        ? "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-500/40 dark:text-emerald-300 font-bold"
                        : "bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-muted)]"
                    }`}
                  >
                    ({term.bit} · 2{formatExponent(term.power).slice(1)})
                  </span>
                  {i < polynomialTerms.length - 1 && (
                    <span className="text-[var(--text-muted)]">+</span>
                  )}
                </React.Fragment>
              ))}
              <span className="text-[var(--text-muted)]">=</span>
              <span className="font-bold text-sky-700 dark:text-sky-400 text-sm sm:text-base">{targetDec}₁₀</span>
            </div>
          </div>

          {/* Summe der aktiven Werte */}
          <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/25 font-mono text-xs">
            <div className="text-xs text-sky-800 dark:text-sky-300 mb-1 font-semibold">
              Summe der aktiven Stellenwerte (nur gesetzte 1-Bits):
            </div>
            {activePowers.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
                <span className="text-[var(--text-primary)] font-bold">
                  {activePowers.map((p) => p.val).join(" + ")}
                </span>
                <span className="text-sky-700 dark:text-sky-400 font-extrabold text-base">
                  = {targetDec}₁₀
                </span>
              </div>
            ) : (
              <span className="text-[var(--text-muted)] font-medium">Kein Bit gesetzt = 0</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
