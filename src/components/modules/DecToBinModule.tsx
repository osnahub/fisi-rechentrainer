"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BitRow } from "@/components/ui/BitRow";
import { Conversions, StellenwertStep } from "@/lib/conversions";
import { Check, RefreshCw, Eye, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

interface DecToBinModuleProps {
  onSuccess?: () => void;
  onError?: () => void;
  onPlayClick?: () => void;
  onStreakUpdate?: (correct: boolean) => void;
}

export function DecToBinModule({
  onSuccess,
  onError,
  onStreakUpdate,
}: DecToBinModuleProps) {
  const bitRange = 8;
  const [showPowersHelper, setShowPowersHelper] = useState<boolean>(true);
  const [targetDec, setTargetDec] = useState<number>(0);
  const [bits, setBits] = useState<number[]>(new Array(8).fill(0));
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [solutionSteps, setSolutionSteps] = useState<StellenwertStep[]>([]);

  // Generate random 8-bit number (0-255)
  const generateNewTask = useCallback(() => {
    let nextVal = Math.floor(Math.random() * 256);
    if (nextVal === 0) nextVal = Math.floor(Math.random() * 255) + 1;

    setTargetDec(nextVal);
    setBits(new Array(8).fill(0));
    setFeedback(null);
    setShowSolution(false);
    setSolutionSteps([]);
  }, []);

  useEffect(() => {
    generateNewTask();
  }, [generateNewTask]);

  const currentSum = bits.reduce(
    (acc, bit, idx) => acc + (bit === 1 ? Math.pow(2, bits.length - 1 - idx) : 0),
    0
  );

  const checkAnswer = () => {
    const userBinary = bits.join("");
    const targetBinary = Conversions.decToBin(targetDec, bitRange);
    const isCorrect = userBinary === targetBinary;

    if (isCorrect) {
      setFeedback({
        isCorrect: true,
        message: `Perfekt! ${targetDec}₁₀ ist exakt ${Conversions.formatNibbles(targetBinary)}₂ binär.`,
      });
      onSuccess?.();
      onStreakUpdate?.(true);
    } else {
      const userDec = Conversions.binToDec(userBinary);
      const diff = userDec - targetDec;
      setFeedback({
        isCorrect: false,
        message: `Noch nicht ganz: Deine Bits ergeben aktuell ${userDec} (Differenz: ${diff > 0 ? "+" : ""}${diff}).`,
      });
      onError?.();
      onStreakUpdate?.(false);
    }
  };

  const handleRevealSolution = () => {
    const steps = Conversions.getStellenwertSteps(targetDec, bitRange);
    setSolutionSteps(steps);
    setShowSolution(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Steuerungsleiste: Stellenwerte an/aus */}
      <div className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
        <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--text-secondary)]">
          <span className="px-2.5 py-1 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-300 font-bold">
            8-Bit
          </span>
          <span className="hidden sm:inline text-[var(--text-muted)]">
            (1 Byte · Bereich 0 bis 255)
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

      {/* Haupt-Aufgaben-Karte */}
      <div className="p-3.5 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center shadow-sm relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={13} />
          <span>Aufgabe</span>
        </div>

        <h2 className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
          Wandle diese Dezimalzahl in Binär um:
        </h2>

        <div className="my-3 sm:my-5 flex items-baseline justify-center gap-2">
          <span className="text-5xl sm:text-6xl font-mono font-extrabold text-[var(--text-primary)] tracking-tight">
            {targetDec}
          </span>
          <span className="text-sm sm:text-base font-mono font-medium text-[var(--text-muted)] bg-[var(--bg-card-subtle)] px-2 py-0.5 rounded-lg border border-[var(--border-color)]">
            Basis 10
          </span>
        </div>

        {/* Schalter-Eingabe mit didaktischer BitRow */}
        <div className="my-4 sm:my-6">
          <BitRow bits={bits} onChange={setBits} showPowers={showPowersHelper} />
          
          {/* Live-Summenanzeige */}
          <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-mono">
            <span className="text-[var(--text-muted)]">Aktuelle Summe:</span>
            <span
              className={`font-bold text-sm ${
                currentSum === targetDec
                  ? "text-emerald-600 dark:text-emerald-400"
                  : currentSum > targetDec
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-sky-600 dark:text-sky-400"
              }`}
            >
              {currentSum}
            </span>
            <span className="text-[var(--text-muted)]">/</span>
            <span className="text-[var(--text-secondary)]">Ziel: {targetDec}</span>
          </div>
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
            <span>Neue Zahl</span>
          </button>

          <button
            onClick={handleRevealSolution}
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

      {/* Lösungsweg Aufklappbar */}
      {showSolution && solutionSteps.length > 0 && (
        <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] animate-pop-in space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 flex items-center justify-center text-xs">📖</span>
            <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
              Schritt-für-Schritt Stellenwertmethode (Greedy-Subtraktion) für {targetDec}:
            </h3>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <strong>Didaktisches Prinzip:</strong> Wir prüfen von links nach rechts (vom <strong>MSB</strong> zum <strong>LSB</strong>), ob der aktuelle Stellenwert in die Restzahl hineinpasst. Wenn ja, setzen wir das Bit auf <strong>1</strong> und subtrahieren den Wert. Wenn nein, setzen wir <strong>0</strong>.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse min-w-[340px]">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-left">
                  <th className="py-2 px-2">Potenz</th>
                  <th className="py-2 px-2 text-center">Wert</th>
                  <th className="py-2 px-2">Prüfung & Subtraktion</th>
                  <th className="py-2 px-2 text-center">Bit</th>
                  <th className="py-2 px-2 text-right">Neuer Rest</th>
                </tr>
              </thead>
              <tbody>
                {solutionSteps.map((s, i) => (
                  <tr key={i} className={`border-b border-[var(--border-color)]/30 ${s.fits ? "bg-emerald-500/10 dark:bg-emerald-500/5" : ""}`}>
                    <td className="py-2 px-2 text-sky-700 dark:text-sky-400 font-semibold">
                      2^{s.power}
                      {i === 0 && <span className="ml-1.5 text-[10px] text-amber-800 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-950/40 px-1 py-0.5 rounded">MSB</span>}
                      {i === solutionSteps.length - 1 && <span className="ml-1.5 text-[10px] text-indigo-800 dark:text-indigo-300 font-bold bg-indigo-100 dark:bg-indigo-950/40 px-1 py-0.5 rounded">LSB</span>}
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-[var(--text-primary)]">{s.val}</td>
                    <td className="py-2 px-2">
                      {s.fits ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                          {s.prevRemainder} ≥ {s.val} ➔ {s.prevRemainder} - {s.val} = {s.newRemainder}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)]">
                          {s.prevRemainder} &lt; {s.val} ➔ passt nicht
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-center font-bold text-sm">
                      <span className={s.bit === 1 ? "text-emerald-700 dark:text-emerald-400 font-black" : "text-[var(--text-muted)]"}>
                        {s.bit}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-[var(--text-secondary)]">{s.newRemainder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/25 font-mono text-xs flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[var(--text-muted)]">Gegenprobe: </span>
              <span className="text-sky-800 dark:text-sky-300 font-bold">
                {solutionSteps.filter((s) => s.bit === 1).map((s) => s.val).join(" + ") || "0"} = {targetDec}₁₀
              </span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Binärcode: </span>
              <span className="font-bold text-sky-700 dark:text-sky-400 text-sm">
                {Conversions.formatNibbles(Conversions.decToBin(targetDec, bitRange))}₂
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
