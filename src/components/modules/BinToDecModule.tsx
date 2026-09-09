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
          <span className="text-xs px-2.5 sm:px-3 py-1.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-400 font-mono font-semibold">
            8-Bit (1 Byte · Bereich 0 bis 255)
          </span>
        </div>

        <button
          onClick={() => setShowPowersHelper((prev) => !prev)}
          className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium flex items-center gap-1.5 ${
            showPowersHelper
              ? "bg-sky-500 text-white border-sky-400 font-semibold shadow-sm"
              : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
          }`}
        >
          <span>Stellenwerte {showPowersHelper ? "an" : "aus"}</span>
          <span>💡</span>
        </button>
      </div>

      {/* Aufgaben-Karte */}
      <div className="p-5 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center shadow-sm relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={13} />
          <span>Aufgabe</span>
        </div>

        <h2 className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
          Wandle dieses Bitmuster in die Dezimalzahl um:
        </h2>

        {/* Visuelle Bit-Anzeige nach Nibbles gegliedert */}
        <div className="w-full max-w-xl mx-auto flex items-center justify-center gap-2 sm:gap-4 overflow-x-auto my-5 sm:my-7 py-1 px-1">
          {nibbles.map((nibble, nIdx) => (
            <React.Fragment key={nIdx}>
              <div className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]/60">
                {nibble.map(({ bit, powerVal, exponent, isOn, originalIndex, isMSB, isLSB }) => (
                  <div
                    key={originalIndex}
                    className="flex flex-col items-center gap-1 min-w-[34px] sm:min-w-[44px]"
                  >
                    <div className="flex flex-col items-center min-h-[30px] justify-end">
                      {showPowersHelper && isMSB && (
                        <span className="text-[8px] font-mono font-bold tracking-tight text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded border border-amber-400/20 leading-none mb-0.5">
                          MSB
                        </span>
                      )}
                      {showPowersHelper && isLSB && (
                        <span className="text-[8px] font-mono font-bold tracking-tight text-indigo-400 bg-indigo-400/10 px-1 py-0.5 rounded border border-indigo-400/20 leading-none mb-0.5">
                          LSB
                        </span>
                      )}
                      {showPowersHelper && !isMSB && !isLSB && (
                        <span className="text-[9px] font-mono text-[var(--text-muted)] opacity-60 leading-none mb-0.5">
                          {formatExponent(exponent)}
                        </span>
                      )}
                      <span
                        className={`text-[10px] sm:text-xs font-mono font-medium transition-opacity ${
                          showPowersHelper
                            ? isOn
                              ? "text-sky-400 font-bold opacity-100"
                              : "text-[var(--text-muted)] opacity-60"
                            : "opacity-0 select-none"
                        }`}
                      >
                        {powerVal}
                      </span>
                    </div>
                    <div
                      className={`w-8.5 h-11 xs:w-9.5 xs:h-12 sm:w-11 sm:h-14 rounded-xl font-mono text-base sm:text-xl font-bold border flex items-center justify-center select-none transition-all ${
                        isOn
                          ? "bg-[var(--bit-on-bg)] border-[var(--bit-on-border)] text-white shadow-md shadow-sky-500/30 scale-105"
                          : "bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--bit-off-text)]"
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

        {/* Aktionsleiste (Mobile First mit voller Touch-Breite) */}
        <div className="flex flex-col xs:flex-row items-center justify-center gap-2.5 sm:gap-3 mt-5">
          <button
            onClick={checkAnswer}
            className="w-full xs:w-auto min-h-[44px] flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold transition-all cursor-pointer shadow-md shadow-sky-500/25"
          >
            <Check size={18} />
            <span>Ergebnis prüfen</span>
          </button>

          <div className="flex items-center gap-2 w-full xs:w-auto">
            <button
              onClick={() => generateNewTask()}
              className="flex-1 xs:flex-none min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer text-xs font-medium"
            >
              <RefreshCw size={15} />
              <span>Neues Muster</span>
            </button>
            <button
              onClick={() => setShowSolution(true)}
              className="flex-1 xs:flex-none min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-sky-400 hover:border-sky-500/40 transition-all cursor-pointer text-xs font-medium"
            >
              <Eye size={15} />
              <span>Lösungsweg</span>
            </button>
          </div>
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
            <span className="w-5 h-5 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs">📖</span>
            <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
              Mathematische Herleitung (Polynomdarstellung):
            </h3>
          </div>

          {/* Formel-Header */}
          <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-mono">
            <div className="text-[var(--text-muted)] text-[11px] mb-1">Stellenwert-Definition im Zweiersystem:</div>
            <div className="text-sky-400 font-bold sm:text-sm">
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
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-bold"
                        : "bg-[var(--bg-input)] border-transparent text-[var(--text-muted)] opacity-60"
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
              <span className="font-bold text-sky-400 text-sm sm:text-base">{targetDec}₁₀</span>
            </div>
          </div>

          {/* Summe der aktiven Werte */}
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/25 font-mono text-xs">
            <div className="text-[11px] text-sky-300 mb-1 font-medium">
              Summe der aktiven Stellenwerte (nur gesetzte 1-Bits):
            </div>
            {activePowers.length > 0 ? (
              <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
                <span className="text-[var(--text-primary)] font-bold">
                  {activePowers.map((p) => p.val).join(" + ")}
                </span>
                <span className="text-sky-400 font-extrabold text-base">
                  = {targetDec}₁₀
                </span>
              </div>
            ) : (
              <span className="text-[var(--text-muted)]">Kein Bit gesetzt = 0</span>
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
