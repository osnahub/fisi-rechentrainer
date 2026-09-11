"use client";

import React, { useState } from "react";
import { BitRow } from "@/components/ui/BitRow";
import { Conversions } from "@/lib/conversions";
import { Sparkles, Keyboard, ToggleLeft } from "lucide-react";
import { useExerciseState } from "@/hooks/useExerciseState";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { ExerciseActions } from "@/components/ui/ExerciseActions";

import { validateExactBitPattern } from "@/lib/validation";

interface DecToBinModuleProps {
  rng?: () => number;
}

type InputMethod = "click" | "type";

export function DecToBinModule({ rng }: DecToBinModuleProps) {
  const bitRange = 8;
  const [showPowersHelper, setShowPowersHelper] = useState<boolean>(true);
  const [inputMethod, setInputMethod] = useState<InputMethod>("click");
  const [bits, setBits] = useState<number[]>(() => new Array(8).fill(0));

  const exercise = useExerciseState<number>({
    generator: (prev, customRng) => {
      const getR = customRng || rng || Math.random;
      let next = Math.floor(getR() * 256);
      while (next === prev) {
        next = Math.floor(getR() * 256);
      }
      return next;
    },
    validator: (input, target) => {
      const targetBinary = Conversions.decToBin(target, bitRange);
      if (inputMethod === "click") {
        return bits.join("") === targetBinary;
      } else {
        const check = validateExactBitPattern(input, bitRange);
        return check.ok && check.clean === targetBinary;
      }
    },
    getSuccessMessage: (target) => {
      const targetBin = Conversions.decToBin(target, bitRange);
      return `Perfekt! ${target}₁₀ ist exakt ${Conversions.formatNibbles(targetBin)}₂ binär.`;
    },
    getErrorMessage: (target, input) => {
      if (inputMethod === "type") {
        const check = validateExactBitPattern(input, bitRange);
        if (!check.ok) {
          return check.error || "Ungültiges Binärmuster.";
        }
        const userDec = Conversions.binToDec(check.clean!);
        const diff = userDec - target;
        return `Noch nicht ganz: Deine Eingabe entspricht ${userDec}₁₀ (Differenz: ${diff > 0 ? "+" : ""}${diff}).`;
      }
      const userDec = Conversions.binToDec(bits.join(""));
      const diff = userDec - target;
      return `Noch nicht ganz: Deine Auswahl entspricht ${userDec}₁₀ (Differenz: ${diff > 0 ? "+" : ""}${diff}).`;
    },
    getHint: (_input, target, attemptCount) => {
      if (attemptCount >= 1) {
        return `💡 Tipp: Zerlege ${target} mittels Stellenwertmethode: Größte passende Zweierpotenz abziehen (${
          target >= 128
            ? "128"
            : target >= 64
            ? "64"
            : target >= 32
            ? "32"
            : target >= 16
            ? "16"
            : target >= 8
            ? "8"
            : target >= 4
            ? "4"
            : target >= 2
            ? "2"
            : "1"
        }).`;
      }
      return null;
    },
    rng,
  });

  const targetDec = exercise.target ?? 0;
  const targetBinary = exercise.isMounted ? Conversions.decToBin(targetDec, bitRange) : "00000000";

  // Sync bits with reset on next task
  const handleNextTask = () => {
    setBits(new Array(bitRange).fill(0));
    exercise.nextTask();
  };

  const handleBitsChange = (newBits: number[]) => {
    setBits(newBits);
    exercise.setUserInput(newBits.join(""));
  };

  const currentSum = bits.reduce(
    (acc, bit, idx) => acc + (bit === 1 ? Math.pow(2, bits.length - 1 - idx) : 0),
    0
  );

  const solutionSteps = exercise.isMounted
    ? Conversions.getStellenwertSteps(targetDec, bitRange)
    : [];

  if (!exercise.isMounted) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-14 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] animate-pulse" />
        <div className="p-5 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] min-h-[360px] flex flex-col items-center justify-center animate-pulse">
          <div className="w-32 h-6 bg-[var(--bg-card-subtle)] rounded-full mb-4" />
          <div className="w-48 h-12 bg-[var(--bg-card-subtle)] rounded-2xl mb-6" />
          <div className="w-64 h-10 bg-[var(--bg-card-subtle)] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Steuerungsleiste: Modus-Wahl & Stellenwerte-Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
        <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-[var(--text-secondary)]">
          <span className="h-9 inline-flex items-center px-2.5 sm:px-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-300 font-bold">
            8-Bit
          </span>
          <span className="hidden sm:inline text-[var(--text-muted)]">
            (1 Byte · Bereich 0 bis 255)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Umschalter: Bits klicken vs. Freie Tastatureingabe */}
          <div className="flex items-center gap-1.5" role="group" aria-label="Eingabemodus">
            <button
              type="button"
              onClick={() => setInputMethod("click")}
              aria-pressed={inputMethod === "click"}
              className={`h-9 text-xs px-2.5 sm:px-3 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                inputMethod === "click"
                  ? "bg-[var(--primary-btn-bg)] text-white border-[var(--primary-btn-bg)] font-semibold shadow-sm"
                  : "border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]"
              }`}
            >
              <ToggleLeft size={13} className={inputMethod === "click" ? "text-white shrink-0" : "text-sky-700 dark:text-sky-400 shrink-0"} />
              <span>Bits klicken</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMethod("type")}
              aria-pressed={inputMethod === "type"}
              className={`h-9 text-xs px-2.5 sm:px-3 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                inputMethod === "type"
                  ? "bg-[var(--primary-btn-bg)] text-white border-[var(--primary-btn-bg)] font-semibold shadow-sm"
                  : "border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]"
              }`}
            >
              <Keyboard size={13} className={inputMethod === "type" ? "text-white shrink-0" : "text-sky-700 dark:text-sky-400 shrink-0"} />
              <span>Binär tippen</span>
            </button>
          </div>

          {/* Stellenwerte Ein/Aus */}
          <button
            type="button"
            onClick={() => setShowPowersHelper((prev) => !prev)}
            className={`h-9 text-xs px-3 rounded-xl border transition-all cursor-pointer font-medium flex items-center gap-1.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
              showPowersHelper
                ? "bg-[var(--primary-btn-bg)] text-white border-[var(--primary-btn-bg)] font-semibold shadow-sm"
                : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
            }`}
          >
            <span>Stellenwerte {showPowersHelper ? "an" : "aus"}</span>
            <span>💡</span>
          </button>
        </div>
      </div>

      {/* Haupt-Aufgaben-Karte */}
      <div className="p-3.5 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center shadow-sm relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={13} />
          <span>Aufgabe</span>
        </div>

        <h2 className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
          Wandle diese Dezimalzahl in das 8-Bit-Muster um:
        </h2>

        <div className="my-3 sm:my-5 flex items-baseline justify-center gap-2">
          <span className="text-5xl sm:text-6xl font-mono font-extrabold text-[var(--text-primary)] tracking-tight">
            {targetDec}
          </span>
          <span className="text-sm sm:text-base font-mono font-medium text-[var(--text-muted)] bg-[var(--bg-card-subtle)] px-2 py-0.5 rounded-lg border border-[var(--border-color)]">
            Basis 10
          </span>
        </div>

        {/* Interaktive Schalter-Eingabe (Bits klicken) */}
        {inputMethod === "click" ? (
          <div className="my-4 sm:my-6">
            <BitRow bits={bits} onChange={handleBitsChange} showPowers={showPowersHelper} />

            {/* Live-Summenanzeige */}
            <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs font-mono">
              <span className="text-[var(--text-muted)]">Aktuelle Summe:</span>
              <span
                className={`font-bold text-sm ${
                  currentSum === targetDec
                    ? "text-emerald-700 dark:text-emerald-400"
                    : currentSum > targetDec
                    ? "text-rose-700 dark:text-rose-400"
                    : "text-sky-700 dark:text-sky-400"
                }`}
              >
                {currentSum}
              </span>
              <span className="text-[var(--text-muted)]">/</span>
              <span className="text-[var(--text-secondary)]">Ziel: {targetDec}</span>
            </div>
          </div>
        ) : (
          /* Freie Tastatureingabe (Binär tippen) */
          <div className="max-w-xs mx-auto my-4 sm:my-6">
            <label htmlFor="dec2bin-type-input" className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
              8-Bit-Binärmuster eingeben:
            </label>
            <input
              id="dec2bin-type-input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              spellCheck="false"
              value={exercise.userInput}
              onChange={(e) => exercise.setUserInput(e.target.value)}
              onKeyDown={exercise.handleKeyDown}
              placeholder="z. B. 10101010"
              aria-describedby="dec2bin-hint"
              aria-invalid={exercise.status === "incorrect"}
              className="w-full text-center font-mono text-2xl sm:text-3xl py-3 px-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
            />
            <p id="dec2bin-hint" className="text-[11px] text-[var(--text-muted)] mt-2">
              Genau 8 Stellen (0 oder 1). Drücke Enter zum Prüfen.
            </p>
          </div>
        )}

        {/* Aktionsleiste */}
        <ExerciseActions
          isCompleted={exercise.isCompleted}
          onCheck={exercise.checkAnswer}
          onNext={handleNextTask}
          onRevealSolution={exercise.revealSolution}
        />

        {/* Barrierefreies Feedback */}
        <FeedbackMessage feedback={exercise.feedback} />
      </div>

      {/* Didaktischer Lösungsweg */}
      {(exercise.solutionRevealed || exercise.status === "revealed") && (
        <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] animate-pop-in space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 flex items-center justify-center text-xs">📖</span>
            <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
              Schritt-für-Schritt Stellenwertmethode (Greedy-Subtraktion) für {targetDec}₁₀:
            </h3>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <strong>Didaktisches Prinzip:</strong> Wir prüfen vom <strong>MSB</strong> zum <strong>LSB</strong>, ob der aktuelle Stellenwert in den Rest hineinpasst. Wenn ja: Bit auf <strong>1</strong> und Wert abziehen; andernfalls Bit auf <strong>0</strong>.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse min-w-[340px]">
              <caption className="sr-only">Schritte der Stellenwertmethode für {targetDec}</caption>
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-left">
                  <th scope="col" className="py-2 px-2">Potenz</th>
                  <th scope="col" className="py-2 px-2 text-center">Wert</th>
                  <th scope="col" className="py-2 px-2">Prüfung &amp; Subtraktion</th>
                  <th scope="col" className="py-2 px-2 text-center">Bit</th>
                  <th scope="col" className="py-2 px-2 text-right">Neuer Rest</th>
                </tr>
              </thead>
              <tbody>
                {solutionSteps.map((s, i) => (
                  <tr key={i} className={`border-b border-[var(--border-color)]/30 ${s.fits ? "bg-emerald-500/10 dark:bg-emerald-500/5" : ""}`}>
                    <td className="py-2 px-2 text-sky-700 dark:text-sky-400 font-semibold">
                      2^{s.power}
                      {i === 0 && <span className="ml-1.5 text-[10px] text-amber-900 dark:text-amber-200 font-bold bg-amber-200 dark:bg-amber-950 px-1 py-0.5 rounded">MSB</span>}
                      {i === solutionSteps.length - 1 && <span className="ml-1.5 text-[10px] text-indigo-900 dark:text-indigo-200 font-bold bg-indigo-200 dark:bg-indigo-950 px-1 py-0.5 rounded">LSB</span>}
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
                {Conversions.formatNibbles(targetBinary)}₂
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
