"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Conversions } from "@/lib/conversions";
import { Check, RefreshCw, Eye, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface BinToDecModuleProps {
  onSuccess?: () => void;
  onError?: () => void;
  onPlayClick?: () => void;
  onStreakUpdate?: (correct: boolean) => void;
}

export function BinToDecModule({
  onSuccess,
  onError,
  onStreakUpdate,
}: BinToDecModuleProps) {
  const [targetBinary, setTargetBinary] = useState<string>("00000000");
  const [showPowersHelper, setShowPowersHelper] = useState<boolean>(false);
  const [userDecInput, setUserDecInput] = useState<string>("");
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  const generateNewTask = useCallback(() => {
    let val = Math.floor(Math.random() * 256);
    if (val === 0) val = Math.floor(Math.random() * 255) + 1;

    setTargetBinary(Conversions.decToBin(val, 8));
    setUserDecInput("");
    setFeedback(null);
    setShowSolution(false);
  }, []);

  useEffect(() => {
    generateNewTask();
  }, [generateNewTask]);

  const targetDec = Conversions.binToDec(targetBinary);
  const bitArray = targetBinary.split("").map(Number);

  const checkAnswer = () => {
    const val = parseInt(userDecInput.trim(), 10);
    if (isNaN(val)) {
      setFeedback({ isCorrect: false, message: "Bitte eine gültige Dezimalzahl eingeben." });
      onError?.();
      onStreakUpdate?.(false);
      return;
    }

    if (val === targetDec) {
      setFeedback({
        isCorrect: true,
        message: `Richtig! ${Conversions.formatNibbles(targetBinary)}₂ entspricht ${targetDec}₁₀.`,
      });
      onSuccess?.();
      onStreakUpdate?.(true);
    } else {
      const diff = val - targetDec;
      setFeedback({
        isCorrect: false,
        message: `Leider falsch: ${val} ist nicht korrekt (Differenz: ${diff > 0 ? "+" : ""}${diff}). Versuche es noch einmal!`,
      });
      onError?.();
      onStreakUpdate?.(false);
    }
  };

  // Build active powers string for solution
  const activePowers: { power: number; val: number }[] = [];
  bitArray.forEach((b, idx) => {
    if (b === 1) {
      const p = bitArray.length - 1 - idx;
      activePowers.push({ power: p, val: Math.pow(2, p) });
    }
  });

  // Group bit display into 4-bit nibbles with mathematical annotations
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
          onClick={() => setShowPowersHelper((prev) => !prev)}
          className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
            showPowersHelper
              ? "bg-sky-600 dark:bg-sky-500 text-white border-sky-600 dark:border-sky-400 font-semibold shadow-sm"
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

        {/* Visuelle Bit-Anzeige nach Nibbles gegliedert (Zero horizontal scroll needed on mobile) */}
        <div className="w-full max-w-xl mx-auto flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-4 overflow-x-auto my-4 sm:my-7 py-1 px-0.5 sm:px-1">
          {nibbles.map((nibble, nIdx) => (
            <React.Fragment key={nIdx}>
              <div className="flex items-center gap-0.5 xs:gap-1 sm:gap-1.5 p-0.5 xs:p-1 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]/60">
                {nibble.map(({ bit, powerVal, exponent, isOn, originalIndex, isMSB, isLSB }) => (
                  <div
                    key={originalIndex}
                    className="flex flex-col items-center gap-0.5 sm:gap-1 min-w-[30px] xs:min-w-[36px] sm:min-w-[44px]"
                  >
                    {/* Feste Höhe (h-9 = 36px): Verhindert jegliche Höhenänderung oder Springen beim Umschalten */}
                    <div className="h-9 w-full flex flex-col items-center justify-end">
                      <div
                        className={`flex flex-col items-center justify-end transition-opacity duration-200 ${
                          showPowersHelper
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
                          className={`text-[10px] sm:text-xs font-mono ${
                            isOn
                              ? "text-sky-600 dark:text-sky-400 font-bold"
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
                          ? "bg-[var(--bit-on-bg)] border-[var(--bit-on-border)] text-white shadow-md shadow-sky-600/20 dark:shadow-sky-500/30 scale-105"
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

        {/* Eingabefeld für Dezimalwert mit mobile-optimiertem inputMode */}
        <div className="max-w-xs mx-auto my-4 sm:my-6">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            value={userDecInput}
            onChange={(e) => setUserDecInput(e.target.value.replace(/[^0-9]/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
            placeholder="Dezimalwert eingeben..."
            className="w-full text-center font-mono text-2xl sm:text-3xl py-3 px-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>

        {/* Aktionsleiste */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-5">
          <button
            onClick={checkAnswer}
            className="min-h-[42px] flex items-center justify-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md shadow-sky-500/25"
          >
            <Check size={16} />
            <span>Ergebnis prüfen</span>
          </button>

          <button
            onClick={() => generateNewTask()}
            className="min-h-[42px] flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer text-xs font-medium"
          >
            <RefreshCw size={14} />
            <span>Neues Muster</span>
          </button>

          <button
            onClick={() => setShowSolution(true)}
            className="min-h-[42px] flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-500/40 transition-all cursor-pointer text-xs font-medium"
          >
            <Eye size={14} />
            <span>Lösungsweg</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-5 p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-medium border flex items-center justify-center gap-2 animate-pop-in ${
              feedback.isCorrect
                ? "bg-[var(--success-bg)] border-[var(--success-border)] text-[var(--success-text)]"
                : "bg-[var(--error-bg)] border-[var(--error-border)] text-[var(--error-text)]"
            }`}
          >
            {feedback.isCorrect ? (
              <CheckCircle2 size={18} className="shrink-0" />
            ) : (
              <AlertCircle size={18} className="shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}
      </div>

      {/* Didaktischer Lösungsweg mit Polynomdarstellung */}
      {showSolution && (
        <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] animate-pop-in space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 flex items-center justify-center text-xs">📖</span>
            <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
              Mathematische Herleitung (Polynomdarstellung):
            </h3>
          </div>

          {/* Formel-Header */}
          <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-mono">
            <div className="text-[var(--text-muted)] text-[11px] mb-1">Stellenwert-Definition im Zweiersystem:</div>
            <div className="text-sky-700 dark:text-sky-400 font-bold sm:text-sm">
              N₁₀ = ∑ (bᵢ · 2ⁱ) = (b_{bitArray.length - 1} · 2^{bitArray.length - 1}) + … + (b₀ · 2⁰)
            </div>
          </div>

          {/* Konkrete Terme-Aufschlüsselung */}
          <div className="space-y-1.5">
            <div className="text-[11px] text-[var(--text-secondary)] font-medium">
              Eingesetzte Bitwerte & Potenzen:
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
                    title={
                      term.isActive
                        ? `Bit ${term.power} ist 1: 1 × ${term.val} = ${term.val}`
                        : `Bit ${term.power} ist 0: 0 × ${term.val} = 0`
                    }
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
            <div className="text-[11px] text-sky-800 dark:text-sky-300 mb-1 font-semibold">
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

          <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            💡 <strong>Didaktischer Merksatz:</strong> Bits mit dem Wert <strong>0</strong> multiplizieren ihre Potenz mit 0 (z. B. 0 · 64 = 0) und leisten daher keinen Beitrag zur Gesamtsumme. Man addiert im Kopf lediglich die Potenzen der <strong>1-Bits</strong>.
          </div>
        </div>
      )}
    </div>
  );
}
