"use client";

import React, { useState } from "react";
import { Conversions } from "@/lib/conversions";
import { ArrowUp, Calculator, Sparkles } from "lucide-react";

interface ExplainerModuleProps {
  onPlayClick: () => void;
}

type InputFormat = "dec" | "bin" | "hex";

export function ExplainerModule({ onPlayClick }: ExplainerModuleProps) {
  const [format, setFormat] = useState<InputFormat>("dec");
  const [inputValue, setInputValue] = useState<string>("173");

  // Determine current decimal number safely
  let currentDec = 0;
  if (format === "dec") {
    currentDec = Math.max(0, parseInt(inputValue, 10) || 0);
  } else if (format === "bin") {
    currentDec = Conversions.binToDec(inputValue);
  } else if (format === "hex") {
    currentDec = Conversions.hexToDec(inputValue);
  }

  // Cap at 65535 for sanity
  if (currentDec > 65535) currentDec = 65535;

  const bitCount = currentDec > 255 ? 16 : 8;
  const currentBin = Conversions.decToBin(currentDec, bitCount);
  const currentHex = Conversions.decToHex(currentDec, currentDec > 255 ? 4 : 2);

  const stellenwertSteps = Conversions.getStellenwertSteps(currentDec, bitCount);
  const divisionSteps = Conversions.getDivisionSteps(currentDec);
  const hexDivisionSteps = Conversions.getHexDivisionSteps(currentDec);

  const setPreset = (val: number) => {
    onPlayClick();
    setFormat("dec");
    setInputValue(String(val));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Eingabebereich */}
      <div className="p-5 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <Calculator size={16} />
            </div>
            <div>
              <h2 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                Universeller Erklär-Rechner
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Beliebige Zahl eingeben und sofort 3 Rechenwege ansehen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-color)]">
            {(
              [
                { id: "dec", label: "Dezimal" },
                { id: "bin", label: "Binär" },
                { id: "hex", label: "Hex" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  onPlayClick();
                  setFormat(f.id);
                  if (f.id === "dec") setInputValue(String(currentDec));
                  if (f.id === "bin") setInputValue(currentBin);
                  if (f.id === "hex") setInputValue(currentHex);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                  format === f.id
                    ? "bg-sky-500 text-white font-semibold shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input & Schnellwahltasten */}
        <div className="max-w-md mx-auto my-3 sm:my-5">
          <input
            type="text"
            inputMode={format === "hex" ? "text" : "numeric"}
            autoCapitalize={format === "hex" ? "characters" : "off"}
            autoCorrect="off"
            spellCheck="false"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Zahl eingeben (${format})...`}
            className="w-full text-center font-mono text-2xl sm:text-3xl py-3 px-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all uppercase"
          />

          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            <span className="text-[11px] text-[var(--text-muted)] mr-1">Prüfungs-Beispiele:</span>
            {[42, 128, 170, 192, 240, 255].map((preset) => (
              <button
                key={preset}
                onClick={() => setPreset(preset)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:border-sky-400 hover:text-sky-400 transition-all cursor-pointer"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Schnellübersicht der 3 Formate */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-6 pt-5 border-t border-[var(--border-color)] font-mono text-center">
          <div className="p-3 sm:p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <span className="text-[10px] sm:text-xs text-[var(--text-muted)] block">Dezimalsystem (Basis 10)</span>
            <span className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">{currentDec}</span>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <span className="text-[10px] sm:text-xs text-[var(--text-muted)] block">Dualsystem (Basis 2)</span>
            <span className="text-lg sm:text-xl font-bold text-sky-400">
              {Conversions.formatNibbles(currentBin)}
            </span>
          </div>
          <div className="p-3 sm:p-4 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <span className="text-[10px] sm:text-xs text-[var(--text-muted)] block">Hexadezimal (Basis 16)</span>
            <span className="text-lg sm:text-xl font-bold text-indigo-400">0x{currentHex}</span>
          </div>
        </div>
      </div>

      {/* Die 3 didaktischen Rechenwege */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Weg 1: Stellenwertmethode */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                Stellenwertmethode (Subtraktion)
              </h3>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mb-3">
              Schnellste Kopfrechenmethode: Passt die Zweierpotenz in den Rest?
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono border-collapse min-w-[240px]">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-left">
                    <th className="py-1.5 px-1">Potenz</th>
                    <th className="py-1.5 px-1">Wert</th>
                    <th className="py-1.5 px-1 text-center">Bit</th>
                    <th className="py-1.5 px-1 text-right">Rest</th>
                  </tr>
                </thead>
                <tbody>
                  {stellenwertSteps.map((s, idx) => (
                    <tr key={idx} className={`border-b border-[var(--border-color)]/20 ${s.fits ? "bg-emerald-500/5" : ""}`}>
                      <td className="py-1.5 px-1 text-sky-400 font-medium">
                        2^{s.power}
                        {idx === 0 && <span className="ml-1 text-[8px] text-amber-400 font-bold">MSB</span>}
                        {idx === stellenwertSteps.length - 1 && <span className="ml-1 text-[8px] text-indigo-400 font-bold">LSB</span>}
                      </td>
                      <td className="py-1.5 px-1 font-bold text-[var(--text-primary)]">{s.val}</td>
                      <td className="py-1.5 px-1 text-center font-bold">
                        <span className={s.bit === 1 ? "text-emerald-400" : "text-[var(--text-muted)]"}>
                          {s.bit}
                        </span>
                      </td>
                      <td className="py-1.5 px-1 text-right text-[var(--text-secondary)]">{s.newRemainder}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3.5 p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 font-mono text-center">
            {stellenwertSteps.filter((s) => s.bit === 1).map((s) => s.val).join(" + ") || "0"} = {currentDec}₁₀
          </div>
        </div>

        {/* Weg 2: Restwertmethode (Division durch 2) */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                Restwertmethode (:2)
              </h3>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mb-3">
              Klassische Papiermethode: Fortlaufend durch 2 teilen und Reste sammeln.
            </p>

            <div className="space-y-1 text-xs font-mono max-h-[280px] overflow-y-auto pr-1">
              {divisionSteps.map((step) => (
                <div
                  key={step.stepIndex}
                  className="flex items-center justify-between p-1.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]/30"
                >
                  <span>
                    {step.original} : 2 = <strong className="text-[var(--text-primary)]">{step.divResult}</strong>
                  </span>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span className="text-[var(--text-muted)] text-[10px]">Rest:</span>
                    <span className="text-emerald-400 text-sm">{step.remainder}</span>
                    {step.isLSB && (
                      <span className="text-[8px] bg-indigo-400/15 text-indigo-400 px-1 py-0.5 rounded border border-indigo-400/30">
                        LSB
                      </span>
                    )}
                    {step.isMSB && (
                      <span className="text-[8px] bg-amber-400/15 text-amber-400 px-1 py-0.5 rounded border border-amber-400/30">
                        MSB
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3.5 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex flex-col gap-1 text-indigo-300">
            <div className="flex items-center gap-1.5 font-bold text-indigo-400">
              <ArrowUp size={16} className="shrink-0 animate-bounce" />
              <span>Leserichtung: Von unten (MSB) nach oben (LSB)</span>
            </div>
            <div className="font-mono text-[11px] text-[var(--text-secondary)]">
              Endergebnis: <span className="text-emerald-400 font-bold">{Conversions.formatNibbles(currentBin)}₂</span>
            </div>
          </div>
        </div>

        {/* Weg 3: Hex & Nibbles */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                Hexadezimal & Nibbles
              </h3>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mb-3">
              Division durch 16 oder direkte 4-Bit-Nibble-Gruppierung (2⁴ = 16).
            </p>

            <div className="space-y-1.5 text-xs font-mono mb-4">
              {hexDivisionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]/30"
                >
                  <span>
                    {step.original} : 16 = <strong className="text-[var(--text-primary)]">{step.divResult}</strong>
                  </span>
                  <span>
                    Rest: {step.remainder}{" "}
                    <strong className="text-indigo-400 font-bold">➔ &apos;{step.hexChar}&apos;</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] font-mono text-xs space-y-1.5">
            <div className="font-bold text-sky-400 text-xs">4-Bit-Nibbles (2⁴ = 16):</div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Binär: <span className="text-[var(--text-primary)] font-bold">{Conversions.formatNibbles(currentBin)}</span>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">
              Hex: <span className="text-indigo-400 font-bold">0x{currentHex}</span>
            </div>
            {currentDec <= 255 && (
              <div className="text-[10px] text-[var(--text-muted)] border-t border-[var(--border-color)]/40 pt-1">
                Algebra: ({Conversions.binToDec(currentBin.slice(0, 4))} · 16) + {Conversions.binToDec(currentBin.slice(4, 8))} = {currentDec}₁₀
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
