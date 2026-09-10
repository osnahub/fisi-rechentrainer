"use client";

import React, { useState } from "react";
import { Conversions } from "@/lib/conversions";
import { validateExactBitPattern } from "@/lib/validation";
import { NIBBLE_TABLE } from "@/lib/subnetData";
import { Sparkles, Binary, ArrowRightLeft, Calculator, Hexagon } from "lucide-react";
import { useExerciseState } from "@/hooks/useExerciseState";
import { ModeTabs, TabItem } from "@/components/ui/ModeTabs";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { ExerciseActions } from "@/components/ui/ExerciseActions";

export type HexSubMode = "bin2hex" | "hex2bin" | "dec2hex" | "hex2dec";

interface HexModuleProps {
  subMode?: HexSubMode;
  onSubModeChange?: (mode: HexSubMode) => void;
  rng?: () => number;
}

export function HexModule({
  subMode: externalSubMode,
  onSubModeChange,
  rng,
}: HexModuleProps) {
  const [internalSubMode, setInternalSubMode] = useState<HexSubMode>("bin2hex");
  const subMode = externalSubMode || internalSubMode;
  const setSubMode = (m: HexSubMode) => {
    if (onSubModeChange) onSubModeChange(m);
    else setInternalSubMode(m);
  };

  const [showNibbleTable, setShowNibbleTable] = useState<boolean>(false);

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
      const raw = input.trim();
      const targetBin = Conversions.decToBin(target, 8);
      const targetHex = Conversions.decToHex(target, 2);

      switch (subMode) {
        case "bin2hex":
        case "dec2hex": {
          const parsed = Conversions.parseHexInput(raw);
          if (!parsed.ok) return false;
          return parsed.value.clean.padStart(2, "0") === targetHex;
        }
        case "hex2bin": {
          const check = validateExactBitPattern(input, 8);
          if (!check.ok) return false;
          return check.clean === targetBin;
        }
        case "hex2dec": {
          const parsed = Conversions.parseDecimalInput(raw);
          if (!parsed.ok) return false;
          return parsed.value === target;
        }
      }
    },
    getSuccessMessage: (target) => {
      const targetHex = Conversions.decToHex(target, 2);
      return `Exzellent! Das Ergebnis für 0x${targetHex} (${target}₁₀) ist korrekt.`;
    },
    getErrorMessage: (target, input) => {
      switch (subMode) {
        case "hex2bin": {
          const check = validateExactBitPattern(input, 8);
          if (!check.ok) {
            return check.error || "Ungültiges Binärmuster (exakt 8 Bits erforderlich).";
          }
          const userDec = Conversions.binToDec(check.clean!);
          const diff = userDec - target;
          return `Leider falsch: Deine Eingabe entspricht ${userDec}₁₀ (Differenz: ${diff > 0 ? "+" : ""}${diff}).`;
        }
        case "hex2dec": {
          const parsed = Conversions.parseDecimalInput(input);
          if (!parsed.ok) {
            return "Bitte eine gültige positive Dezimalzahl (0–255) eingeben.";
          }
          if (parsed.value > 255) {
            return `Wert zu groß (${parsed.value}): Ein 8-Bit-Wert kann maximal 255 sein.`;
          }
          const diff = parsed.value - target;
          return `Leider falsch: Deine Eingabe war ${parsed.value} (Differenz: ${diff > 0 ? "+" : ""}${diff}).`;
        }
        case "bin2hex":
        case "dec2hex": {
          const parsed = Conversions.parseHexInput(input);
          if (!parsed.ok) {
            return parsed.error || "Ungültiges Hexadezimalformat (z. B. 3F oder 0x3F).";
          }
          return `Leider nicht richtig. Deine Eingabe 0x${parsed.value.clean} entspricht ${parsed.value.value}₁₀. Versuche es erneut!`;
        }
      }
    },
    getHint: (_input, _target, attemptCount) => {
      if (attemptCount >= 1) {
        switch (subMode) {
          case "bin2hex":
            return "💡 Hinweis: Teile das 8-Bit-Byte in zwei 4-Bit-Nibbles auf und wandle jedes Nibble separat in eine Hex-Ziffer (0–F) um.";
          case "hex2bin":
            return "💡 Hinweis: Jede Hex-Ziffer expandiert in exakt 4 Bits (z. B. F ➔ 1111, A ➔ 1010).";
          case "dec2hex":
            return "💡 Hinweis: Teile die Zahl durch 16. Das ganzzahlige Ergebnis ist das High-Nibble, der Rest ist das Low-Nibble.";
          case "hex2dec":
            return "💡 Hinweis: Berechne (High-Hex-Ziffer × 16) + (Low-Hex-Ziffer × 1).";
        }
      }
      return null;
    },
    rng,
  });

  if (!exercise.isMounted) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="h-14 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] animate-pulse" />
        <div className="p-5 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] min-h-[360px] flex flex-col items-center justify-center animate-pulse">
          <div className="w-32 h-6 bg-[var(--bg-card-subtle)] rounded-full mb-4" />
          <div className="w-64 h-12 bg-[var(--bg-card-subtle)] rounded-2xl mb-6" />
          <div className="w-48 h-10 bg-[var(--bg-card-subtle)] rounded-xl" />
        </div>
      </div>
    );
  }

  const taskVal = exercise.target;
  const targetBin = Conversions.decToBin(taskVal, 8);
  const highNibbleBin = targetBin.substring(0, 4);
  const lowNibbleBin = targetBin.substring(4, 8);

  const highNibbleHex = Conversions.binToHex(highNibbleBin);
  const lowNibbleHex = Conversions.binToHex(lowNibbleBin);
  const targetHex = highNibbleHex + lowNibbleHex;

  const hexTabs: TabItem<HexSubMode>[] = [
    { id: "bin2hex", label: "Bin ➔ Hex", fullLabel: "Binär ➔ Hex", detail: "(Nibbles)", icon: Binary },
    { id: "hex2bin", label: "Hex ➔ Bin", fullLabel: "Hex ➔ Binär", detail: "(Expansion)", icon: ArrowRightLeft },
    { id: "dec2hex", label: "Dez ➔ Hex", fullLabel: "Dezimal ➔ Hex", detail: "(:16)", icon: Calculator },
    { id: "hex2dec", label: "Hex ➔ Dez", fullLabel: "Hex ➔ Dezimal", detail: "(Polynom)", icon: Hexagon },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Modus-Auswahl & Nibble-Tabelle-Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
        <ModeTabs
          tabs={hexTabs}
          activeTab={subMode}
          onChange={(newMode) => {
            setSubMode(newMode);
            exercise.nextTask();
          }}
          ariaLabel="Hexadezimal Untermodi"
          size="sm"
          idPrefix="hex"
          panelIdPrefix="hex-panel"
          className="flex-1 min-w-[280px]"
        />

        <button
          type="button"
          onClick={() => setShowNibbleTable((prev) => !prev)}
          aria-expanded={showNibbleTable}
          aria-controls={showNibbleTable ? "nibble-table-panel" : undefined}
          className={`text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer font-medium shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
            showNibbleTable
              ? "bg-[var(--primary-btn-bg)] text-white border-[var(--primary-btn-bg)] font-semibold shadow-sm"
              : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
          }`}
        >
          {showNibbleTable ? "Nibbles verbergen" : "🧩 Nibble-Tabelle"}
        </button>
      </div>

      {/* Zuschaltbare Nibble-Tabelle (0–15 ➔ 0–F) */}
      {showNibbleTable && (
        <div id="nibble-table-panel" className="p-3.5 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] animate-pop-in">
          <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] mb-2.5">
            🧩 Das 4-Bit-Nibble-Prinzip (16 Zustände: 0 bis 15 ➔ 0 bis F):
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 font-mono text-xs">
            {NIBBLE_TABLE.map((row) => (
              <div
                key={row.hex}
                className={`p-2 rounded-xl border text-center ${
                  row.hex === highNibbleHex || row.hex === lowNibbleHex
                    ? "bg-sky-500/15 border-sky-500/40 text-sky-700 dark:text-sky-300 font-bold"
                    : "bg-[var(--bg-card-subtle)] border-[var(--border-color)] text-[var(--text-secondary)]"
                }`}
              >
                <div className="text-sm font-extrabold text-[var(--text-primary)]">{row.hex}</div>
                <div className="text-[11px] text-[var(--text-muted)]">{row.dec} dez</div>
                <div className="text-[11px] font-bold text-sky-700 dark:text-sky-400">{row.bin}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aufgaben-Karte */}
      <div
        id={`hex-panel-${subMode}`}
        role="tabpanel"
        aria-labelledby={`hex-tab-${subMode}`}
        tabIndex={0}
        className="p-5 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center shadow-sm relative overflow-hidden focus:outline-none"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-700 dark:text-sky-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={13} />
          <span>Hex-Aufgabe</span>
        </div>

        {subMode === "bin2hex" && (
          <div>
            <h2 className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
              Wandle dieses Byte mittels 4-Bit-Nibble-Methode in Hex um:
            </h2>
            <div className="flex justify-center items-center gap-2 sm:gap-4 my-5 sm:my-7">
              <div className="p-3 sm:p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-sky-500/30 flex flex-col items-center min-w-[100px] sm:min-w-[120px]">
                <span className="text-xs text-sky-700 dark:text-sky-400 font-bold uppercase tracking-wider mb-1">
                  High-Nibble
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  {highNibbleBin}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center px-1">
                <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Byte
                </span>
                <div className="text-xl sm:text-2xl text-[var(--text-muted)] font-mono font-bold">|</div>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-indigo-500/30 flex flex-col items-center min-w-[100px] sm:min-w-[120px]">
                <span className="text-xs text-indigo-700 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
                  Low-Nibble
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  {lowNibbleBin}
                </span>
              </div>
            </div>
          </div>
        )}

        {subMode === "hex2bin" && (
          <div>
            <h2 className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
              Wandle diesen Hex-Wert in ein 8-Bit-Muster um:
            </h2>
            <div className="text-5xl sm:text-6xl font-mono font-extrabold text-[var(--text-primary)] my-4 sm:my-6">
              0x{targetHex}
            </div>
          </div>
        )}

        {subMode === "dec2hex" && (
          <div>
            <h2 className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
              Wandle diese Dezimalzahl in Hexadezimal um:
            </h2>
            <div className="my-4 sm:my-6 flex items-baseline justify-center gap-2">
              <span className="text-5xl sm:text-6xl font-mono font-extrabold text-[var(--text-primary)]">
                {taskVal}
              </span>
              <span className="text-sm font-mono font-medium text-[var(--text-muted)] bg-[var(--bg-card-subtle)] px-2 py-0.5 rounded-lg border border-[var(--border-color)]">
                Basis 10
              </span>
            </div>
          </div>
        )}

        {subMode === "hex2dec" && (
          <div>
            <h2 className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
              Wandle diesen Hex-Wert in eine Dezimalzahl um:
            </h2>
            <div className="text-5xl sm:text-6xl font-mono font-extrabold text-[var(--text-primary)] my-4 sm:my-6">
              0x{targetHex}
            </div>
          </div>
        )}

        {/* Eingabefeld mit sichtbarem Label */}
        <div className="max-w-xs mx-auto my-4 sm:my-6">
          <label htmlFor="hex-user-input" className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            {subMode === "bin2hex" || subMode === "dec2hex"
              ? "Hexadezimalwert eingeben:"
              : subMode === "hex2bin"
              ? "8-Bit-Binärmuster eingeben:"
              : "Dezimalwert eingeben:"}
          </label>
          <input
            id="hex-user-input"
            type="text"
            inputMode={subMode === "hex2dec" ? "numeric" : "text"}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck="false"
            value={exercise.userInput}
            onChange={(e) => exercise.setUserInput(e.target.value.toUpperCase())}
            onKeyDown={exercise.handleKeyDown}
            placeholder={
              subMode === "bin2hex" || subMode === "dec2hex"
                ? "z. B. 3F oder 0x3F"
                : subMode === "hex2bin"
                ? "z. B. 00111111"
                : "z. B. 63"
            }
            aria-invalid={exercise.status === "incorrect"}
            aria-describedby="hex-user-hint"
            className="w-full text-center font-mono text-2xl sm:text-3xl py-3 px-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all uppercase"
          />
          <p id="hex-user-hint" className="text-[11px] text-[var(--text-muted)] mt-2">
            Drücke Enter zum Prüfen.
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

      {/* Lösungsweg & Mathematische Herleitung */}
      {(exercise.solutionRevealed || exercise.status === "revealed") && (
        <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] animate-pop-in space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 flex items-center justify-center text-xs">📖</span>
            <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
              Mathematischer Lösungsweg für {subMode === "dec2hex" ? `${taskVal}₁₀` : `0x${targetHex}`}:
            </h3>
          </div>

          {subMode === "dec2hex" && (
            <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] font-mono text-xs space-y-2">
              <div className="text-sky-700 dark:text-sky-400 font-bold">
                1. Methode: 16er-Divisionsverfahren mit Rest (Division durch Basis 16):
              </div>
              <div className="space-y-1">
                {Conversions.getHexDivisionSteps(taskVal).map((step, idx, arr) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]/60"
                  >
                    <span>
                      {step.original} : 16 = <strong className="text-[var(--text-primary)]">{step.divResult}</strong>
                    </span>
                    <span>
                      Rest: <strong className="text-sky-700 dark:text-sky-400">{step.remainder}</strong> ➔ Hex:{" "}
                      <strong className="text-emerald-700 dark:text-emerald-400 text-sm">{step.hexChar}</strong>{" "}
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {idx === arr.length - 1 ? "(MSB)" : idx === 0 ? "(LSB)" : ""}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Leserichtung von unten (MSB) nach oben (LSB) ➔ <strong className="text-sky-700 dark:text-sky-400">0x{targetHex}</strong>
              </div>
            </div>
          )}

          {/* Nibble-Methode */}
          <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] text-xs font-mono">
            <div className="text-[var(--text-muted)] text-[11px] mb-1">
              {subMode === "dec2hex" ? "2. Methode: " : ""}Das 4-Bit-Nibble-Prinzip (Basis-Äquivalenz 2⁴ = 16):
            </div>
            <div className="text-sky-700 dark:text-sky-400 font-bold sm:text-sm">
              Genau 4 Bits codieren 16 Zustände (0 bis F). Jedes Byte besteht aus 2 Nibbles (High &amp; Low).
            </div>
            <div className="text-[var(--text-secondary)] text-xs mt-1.5 leading-relaxed">
              Formel zur Basis 16: <strong className="text-[var(--text-primary)]">Wert₁₀ = (High-Nibble · 16¹) + (Low-Nibble · 16⁰) = (H · 16) + L</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 sm:p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-sky-500/30">
              <span className="text-sky-700 dark:text-sky-400 font-bold block mb-1">
                1. High-Nibble (obere 4 Bits, Wertigkeit 16¹):
              </span>
              <div>Binär: <span className="font-bold text-[var(--text-primary)]">{highNibbleBin}</span>₂</div>
              <div className="text-[var(--text-secondary)]">Nibble-Wert: {Conversions.binToDec(highNibbleBin)} dezimal</div>
              <div className="text-sky-700 dark:text-sky-400 font-bold mt-1 text-sm">
                ➔ Hex-Ziffer: <span className="underline">{highNibbleHex}</span> (Wert: {Conversions.binToDec(highNibbleBin)} · 16 = {Conversions.binToDec(highNibbleBin) * 16})
              </div>
            </div>

            <div className="p-3 sm:p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-indigo-500/30">
              <span className="text-indigo-700 dark:text-indigo-400 font-bold block mb-1">
                2. Low-Nibble (untere 4 Bits, Wertigkeit 16⁰):
              </span>
              <div>Binär: <span className="font-bold text-[var(--text-primary)]">{lowNibbleBin}</span>₂</div>
              <div className="text-[var(--text-secondary)]">Nibble-Wert: {Conversions.binToDec(lowNibbleBin)} dezimal</div>
              <div className="text-indigo-700 dark:text-indigo-400 font-bold mt-1 text-sm">
                ➔ Hex-Ziffer: <span className="underline">{lowNibbleHex}</span> (Wert: {Conversions.binToDec(lowNibbleBin)} · 1 = {Conversions.binToDec(lowNibbleBin)})
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/25 font-mono text-xs sm:text-sm text-center">
            <div className="text-xs text-sky-800 dark:text-sky-300 mb-1">Gesamtrechnung:</div>
            <div className="font-bold text-[var(--text-primary)]">
              ({Conversions.binToDec(highNibbleBin)} · 16) + ({Conversions.binToDec(lowNibbleBin)} · 1) = {Conversions.binToDec(highNibbleBin) * 16} + {Conversions.binToDec(lowNibbleBin)} = <span className="text-sky-700 dark:text-sky-400">{taskVal}₁₀</span>
            </div>
            <div className="text-xs text-[var(--text-secondary)] mt-1 font-semibold">
              Hexadezimal: 0x{targetHex} &nbsp;|&nbsp; Dual: {highNibbleBin} {lowNibbleBin}₂ &nbsp;|&nbsp; Dezimal: {taskVal}₁₀
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
