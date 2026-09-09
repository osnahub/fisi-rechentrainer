"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Conversions } from "@/lib/conversions";
import { NIBBLE_TABLE } from "@/lib/subnetData";
import { Check, RefreshCw, Eye, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface HexModuleProps {
  onSuccess?: () => void;
  onError?: () => void;
  onPlayClick?: () => void;
  onStreakUpdate?: (correct: boolean) => void;
}

type HexSubMode = "bin2hex" | "hex2bin" | "dec2hex" | "hex2dec";

export function HexModule({
  onSuccess,
  onError,
  onPlayClick,
  onStreakUpdate,
}: HexModuleProps) {
  const [subMode, setSubMode] = useState<HexSubMode>("bin2hex");
  const [taskVal, setTaskVal] = useState<number>(0); // 0-255 (1 Byte)
  const [userInput, setUserInput] = useState<string>("");
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [showNibbleTable, setShowNibbleTable] = useState<boolean>(false);

  const generateTask = useCallback(() => {
    let val = Math.floor(Math.random() * 256);
    if (val === 0) val = Math.floor(Math.random() * 255) + 1;
    setTaskVal(val);
    setUserInput("");
    setFeedback(null);
    setShowSolution(false);
  }, []);

  useEffect(() => {
    generateTask();
  }, [subMode, generateTask]);

  const targetBin = Conversions.decToBin(taskVal, 8);
  const highNibbleBin = targetBin.substring(0, 4);
  const lowNibbleBin = targetBin.substring(4, 8);

  const highNibbleHex = Conversions.binToHex(highNibbleBin);
  const lowNibbleHex = Conversions.binToHex(lowNibbleBin);
  const targetHex = highNibbleHex + lowNibbleHex;

  const checkAnswer = () => {
    const raw = userInput.trim().toUpperCase().replace(/^0X/, "");
    let isCorrect = false;
    let correctStr = "";

    switch (subMode) {
      case "bin2hex":
        correctStr = targetHex;
        isCorrect = raw.padStart(2, "0") === targetHex;
        break;
      case "hex2bin":
        correctStr = targetBin;
        isCorrect = raw.replace(/\s+/g, "").padStart(8, "0") === targetBin;
        break;
      case "dec2hex":
        correctStr = targetHex;
        isCorrect = raw.padStart(2, "0") === targetHex;
        break;
      case "hex2dec":
        correctStr = String(taskVal);
        isCorrect = /^\d+$/.test(raw) && parseInt(raw, 10) === taskVal;
        break;
    }

    if (isCorrect) {
      setFeedback({
        isCorrect: true,
        message: `Exzellent! Das Ergebnis ist korrekt (${correctStr}).`,
      });
      onSuccess?.();
      onStreakUpdate?.(true);
    } else {
      setFeedback({
        isCorrect: false,
        message: `Leider nicht richtig. Gesucht war: ${correctStr}. Prüfe den Rechenweg unten!`,
      });
      onError?.();
      onStreakUpdate?.(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Modus-Auswahl & Nibble-Tabelle-Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2 sm:p-2.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-1 min-w-[280px]">
          {(
            [
              { id: "bin2hex", label: "Binär ➔ Hex", detail: "(Nibble)" },
              { id: "hex2bin", label: "Hex ➔ Binär", detail: "(Expansion)" },
              { id: "dec2hex", label: "Dezimal ➔ Hex", detail: "(:16 oder Nibble)" },
              { id: "hex2dec", label: "Hex ➔ Dezimal", detail: "(Polynom)" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => {
                onPlayClick?.();
                setSubMode(m.id);
              }}
              className={`text-xs py-2 px-2 rounded-xl border transition-all cursor-pointer font-medium text-center ${
                subMode === m.id
                  ? "bg-sky-600 dark:bg-sky-500 text-white border-sky-600 dark:border-sky-400 font-semibold shadow-sm"
                  : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
              }`}
            >
              <div>{m.label}</div>
              {m.detail && <div className="text-[10px] opacity-75">{m.detail}</div>}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowNibbleTable((prev) => !prev)}
          className={`text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer font-medium shrink-0 ${
            showNibbleTable
              ? "bg-sky-600 dark:bg-sky-500 text-white border-sky-600 dark:border-sky-400 font-semibold shadow-sm"
              : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
          }`}
        >
          {showNibbleTable ? "Nibbles verbergen" : "🧩 Nibble-Tabelle"}
        </button>
      </div>

      {/* Zuschaltbare Nibble-Tabelle (0–15 ➔ 0–F) */}
      {showNibbleTable && (
        <div className="p-3.5 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] animate-pop-in">
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
                <div className="text-[10px] text-[var(--text-muted)]">{row.dec} dez</div>
                <div className="text-[10px] font-bold text-sky-700 dark:text-sky-400">{row.bin}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aufgaben-Karte */}
      <div className="p-5 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center shadow-sm relative overflow-hidden">
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
                <span className="text-[10px] sm:text-xs text-sky-700 dark:text-sky-400 font-bold uppercase tracking-wider mb-1">
                  High-Nibble
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                  {highNibbleBin}
                </span>
              </div>
              <div className="text-xl sm:text-2xl text-[var(--text-muted)] font-mono font-bold">+</div>
              <div className="p-3 sm:p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-indigo-500/30 flex flex-col items-center min-w-[100px] sm:min-w-[120px]">
                <span className="text-[10px] sm:text-xs text-indigo-700 dark:text-indigo-400 font-bold uppercase tracking-wider mb-1">
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

        {/* Eingabefeld (Mobile-Optimiert) */}
        <div className="max-w-xs mx-auto my-4 sm:my-6">
          <input
            type="text"
            inputMode={subMode === "hex2dec" ? "numeric" : "text"}
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck="false"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
            placeholder={
              subMode === "bin2hex" || subMode === "dec2hex"
                ? "z. B. 3F oder 0x3F"
                : subMode === "hex2bin"
                ? "z. B. 00111111"
                : "z. B. 63"
            }
            className="w-full text-center font-mono text-2xl sm:text-3xl py-3 px-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all uppercase"
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
            onClick={() => {
              onPlayClick?.();
              generateTask();
            }}
            className="min-h-[42px] flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer text-xs font-medium"
          >
            <RefreshCw size={14} />
            <span>Neue Aufgabe</span>
          </button>

          <button
            onClick={() => {
              onPlayClick?.();
              setShowSolution(true);
            }}
            className="min-h-[42px] flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-sky-600 dark:hover:text-sky-400 hover:border-sky-500/40 transition-all cursor-pointer text-xs font-medium"
          >
            <Eye size={14} />
            <span>Lösungsweg</span>
          </button>
        </div>

        {/* Feedback */}
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

      {/* Lösungsweg & Mathematische Herleitung */}
      {showSolution && (
        <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] animate-pop-in space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 flex items-center justify-center text-xs">📖</span>
            <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
              Mathematischer Lösungsweg für {subMode === "dec2hex" ? `${taskVal}₁₀` : `0x${targetHex}`}:
            </h3>
          </div>

          {/* Weg 1 bei dec2hex: 16er-Divisionsverfahren mit Rest */}
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
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {idx === arr.length - 1 ? "(MSB)" : idx === 0 ? "(LSB)" : ""}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-[var(--text-secondary)]">
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
              Genau 4 Bits codieren 16 Zustände (0 bis F). Jedes Byte besteht aus 2 Nibbles (High & Low).
            </div>
            <div className="text-[var(--text-secondary)] text-[11px] mt-1.5 leading-relaxed">
              Formel zur Basis 16: <strong className="text-[var(--text-primary)]">Wert₁₀ = (High-Nibble · 16¹) + (Low-Nibble · 16⁰) = (H · 16) + L</strong>
            </div>
          </div>

          {/* Aufschlüsselung der beiden Nibbles */}
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

          {/* Gesamtrechnung */}
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/25 font-mono text-xs sm:text-sm text-center">
            <div className="text-[11px] text-sky-800 dark:text-sky-300 mb-1">Gesamtrechnung:</div>
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
