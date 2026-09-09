"use client";

import React, { useState } from "react";
import { Conversions } from "@/lib/conversions";
import { ArrowUp, Calculator, Sparkles } from "lucide-react";

type InputFormat = "dec" | "bin";

const SUPERSCRIPTS: Record<number, string> = {
  0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴",
  5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹",
};

const formatExponent = (exp: number) => {
  const s = String(exp);
  return "2" + s.split("").map((c) => SUPERSCRIPTS[Number(c)] ?? c).join("");
};

export function ExplainerModule() {
  const [format, setFormat] = useState<InputFormat>("dec");
  const [inputValue, setInputValue] = useState<string>("173");

  // Determine current decimal number safely
  let currentDec = 0;
  if (format === "dec") {
    currentDec = Math.max(0, parseInt(inputValue, 10) || 0);
  } else if (format === "bin") {
    currentDec = Conversions.binToDec(inputValue.replace(/[^01]/g, ""));
  }

  // Calculate bit count dynamically (defaulting to standard 8-bit byte)
  const bitCount = currentDec > 255 ? (currentDec > 65535 ? 32 : 16) : 8;
  const currentBin = Conversions.decToBin(currentDec, bitCount);

  const stellenwertSteps = Conversions.getStellenwertSteps(currentDec, bitCount);
  const divisionSteps = Conversions.getDivisionSteps(currentDec);
  const polynomialTerms = Conversions.getPolynomialExpansion(currentBin);
  const activeBitsCount = currentBin.split("").filter((b) => b === "1").length;

  // Calculate dynamic 4-bit nibbles for all bit lengths
  const nibbleList: { bits: string; decVal: number; hexChar: string; label: string }[] = [];
  const totalNibbles = currentBin.length / 4;
  for (let i = 0; i < currentBin.length; i += 4) {
    const bits = currentBin.slice(i, i + 4);
    const decVal = Conversions.binToDec(bits);
    const hexChar = Conversions.decToHex(decVal, 1);
    const nibbleNum = totalNibbles - i / 4;
    let label = `Nibble ${nibbleNum}`;
    if (bitCount === 8) {
      label = i === 0 ? "High-Nibble (Bits 7..4)" : "Low-Nibble (Bits 3..0)";
    }
    nibbleList.push({ bits, decVal, hexChar, label });
  }

  const setPreset = (val: number) => {
    setFormat("dec");
    setInputValue(String(val));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Eingabebereich */}
      <div className="p-3.5 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center">
              <Calculator size={16} />
            </div>
            <div>
              <h2 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                Universeller Rechenhelfer
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Beliebige Zahl eingeben und sofort 3 didaktische Rechenwege ansehen
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-color)]">
            {(
              [
                { id: "dec", label: "Dezimal (Basis 10)" },
                { id: "bin", label: "Binär (Basis 2)" },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  setFormat(f.id);
                  if (f.id === "dec") setInputValue(String(currentDec));
                  if (f.id === "bin") setInputValue(currentBin);
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
            inputMode="numeric"
            pattern={format === "bin" ? "[01\\s]*" : "[0-9]*"}
            autoCorrect="off"
            spellCheck="false"
            value={inputValue}
            onChange={(e) => {
              const val = e.target.value;
              if (format === "bin") {
                setInputValue(val.replace(/[^01\s]/g, ""));
              } else {
                setInputValue(val.replace(/[^0-9]/g, "").slice(0, 7));
              }
            }}
            placeholder={`Zahl eingeben (${format === "dec" ? "Dezimal 0–65535" : "Binär z. B. 10101101"})...`}
            className="w-full text-center font-mono text-2xl sm:text-3xl py-3 px-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />

          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            <span className="text-[11px] text-[var(--text-muted)] mr-1">Prüfungs-Beispiele:</span>
            {[42, 128, 170, 192, 240, 255].map((preset) => (
              <button
                key={preset}
                onClick={() => setPreset(preset)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:border-sky-500 hover:text-sky-700 dark:hover:text-sky-300 transition-all cursor-pointer font-medium"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Schnellübersicht der Formate (Dezimal, Binär, Hexadezimal, Bit-Status) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mt-6 pt-5 border-t border-[var(--border-color)] font-mono text-center">
          <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <span className="text-[10px] text-[var(--text-muted)] block">Dezimalsystem (Basis 10)</span>
            <span className="text-base sm:text-lg font-bold text-[var(--text-primary)]">{currentDec}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <span className="text-[10px] text-[var(--text-muted)] block">Dualsystem ({bitCount}-Bit)</span>
            <span className="text-base sm:text-lg font-bold text-sky-700 dark:text-sky-400">
              {Conversions.formatNibbles(currentBin)}₂
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <span className="text-[10px] text-[var(--text-muted)] block">Hexadezimal (Basis 16)</span>
            <span className="text-base sm:text-lg font-bold text-indigo-700 dark:text-indigo-400">
              0x{Conversions.decToHex(currentDec, Math.ceil(bitCount / 4))}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
            <span className="text-[10px] text-[var(--text-muted)] block">Bit-Status (1-Bits)</span>
            <span className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400">
              {activeBitsCount} / {bitCount} gesetzt
            </span>
          </div>
        </div>
      </div>

      {/* Die 3 didaktischen Rechenwege – Vollständig scrollbalkenfrei */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
        {/* Weg 1: Stellenwertmethode */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold text-xs">
                1
              </span>
              <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                Stellenwertmethode (Subtraktion)
              </h3>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mb-3">
              Schnellste Kopfrechenmethode: Passt die Zweierpotenz in den Rest?
            </p>

            <table className="w-full text-[11px] sm:text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-left">
                  <th className="py-1 px-1">Potenz</th>
                  <th className="py-1 px-1">Wert</th>
                  <th className="py-1 px-1 text-center">Bit</th>
                  <th className="py-1 px-1 text-right">Rest</th>
                </tr>
              </thead>
              <tbody>
                {stellenwertSteps.map((s, idx) => (
                  <tr key={idx} className={`border-b border-[var(--border-color)]/20 ${s.fits ? "bg-emerald-500/10" : ""}`}>
                    <td className="py-1 px-1 text-sky-700 dark:text-sky-400 font-medium whitespace-nowrap">
                      2^{s.power}
                      {idx === 0 && <span className="ml-1 text-[8px] text-amber-800 bg-amber-100 dark:text-amber-300 dark:bg-amber-950/50 px-1 py-0.5 rounded font-bold">MSB</span>}
                      {idx === stellenwertSteps.length - 1 && <span className="ml-1 text-[8px] text-indigo-800 bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-950/50 px-1 py-0.5 rounded font-bold">LSB</span>}
                    </td>
                    <td className="py-1 px-1 font-bold text-[var(--text-primary)]">{s.val}</td>
                    <td className="py-1 px-1 text-center font-bold">
                      <span className={s.bit === 1 ? "text-emerald-700 dark:text-emerald-400 font-black" : "text-[var(--text-muted)]"}>
                        {s.bit}
                      </span>
                    </td>
                    <td className="py-1 px-1 text-right text-[var(--text-secondary)]">{s.newRemainder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-800 dark:text-sky-200 font-mono text-center font-semibold">
            Gegenprobe: {stellenwertSteps.filter((s) => s.bit === 1).map((s) => s.val).join(" + ") || "0"} = {currentDec}₁₀
          </div>
        </div>

        {/* Weg 2: Restwertmethode (Division durch 2) */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                Restwertmethode (:2)
              </h3>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mb-3">
              Klassische Papiermethode: Fortlaufend durch 2 teilen und Reste sammeln.
            </p>

            {/* Natürlich fließende Liste ohne inneren Scrollbalken */}
            <div className="space-y-1 text-[11px] sm:text-xs font-mono">
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
                    <span className="text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">{step.remainder}</span>
                    {step.isLSB && (
                      <span className="text-[8px] bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 px-1 py-0.5 rounded border border-indigo-300 dark:border-indigo-700 font-bold">
                        LSB
                      </span>
                    )}
                    {step.isMSB && (
                      <span className="text-[8px] bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 px-1 py-0.5 rounded border border-amber-300 dark:border-amber-700 font-bold">
                        MSB
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs flex flex-col gap-1 text-indigo-900 dark:text-indigo-200">
            <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300">
              <ArrowUp size={16} className="shrink-0 animate-bounce" />
              <span>Leserichtung: Von unten (MSB) nach oben (LSB)</span>
            </div>
            <div className="font-mono text-[11px] text-[var(--text-secondary)]">
              Endergebnis: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{Conversions.formatNibbles(currentBin)}₂</span>
              <span className="block text-[10px] text-[var(--text-muted)] mt-0.5">
                (Reste von unten nach oben: {divisionSteps.slice().reverse().map((s) => s.remainder).join("")}₂, mit führenden Nullen auf {bitCount} Bit)
              </span>
            </div>
          </div>
        </div>

        {/* Weg 3: Mathematische Polynom- & Potenzzerlegung */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                3
              </span>
              <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
                Polynom- & Potenzdarstellung
              </h3>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mb-3">
              Mathematischer Beweis über Stellenwert-Polynome zur Basis 2.
            </p>

            <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] font-mono text-[11px] space-y-2 mb-3">
              <div className="text-[var(--text-muted)] text-[10px]">Formel: N₁₀ = ∑ (bᵢ · 2ⁱ)</div>
              <div className="flex flex-wrap gap-1 leading-relaxed">
                {polynomialTerms.map((term, idx) => (
                  <React.Fragment key={term.power}>
                    <span
                      className={`px-1 rounded border ${
                        term.isActive
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700 font-bold"
                          : "bg-[var(--bg-input)] border-transparent text-[var(--text-muted)] opacity-60"
                      }`}
                    >
                      ({term.bit}·{formatExponent(term.power)})
                    </span>
                    {idx < polynomialTerms.length - 1 && <span className="text-[var(--text-muted)]">+</span>}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] font-mono text-xs space-y-1.5">
              <div className="text-[11px] text-sky-700 dark:text-sky-400 font-bold">
                4-Bit-Nibbles ({nibbleList.length} Gruppe{nibbleList.length > 1 ? "n" : ""}):
              </div>
              <div className="space-y-1">
                {nibbleList.map((n, idx) => (
                  <div
                    key={idx}
                    className="text-[11px] text-[var(--text-secondary)] flex items-center justify-between border-b border-[var(--border-color)]/30 pb-0.5 last:border-b-0"
                  >
                    <span>
                      {n.label}: <strong className="text-[var(--text-primary)]">{n.bits}</strong>₂
                    </span>
                    <span className="text-sky-700 dark:text-sky-400 font-semibold">
                      = {n.decVal}₁₀ ➔ <strong className="text-indigo-700 dark:text-indigo-400">{n.hexChar}₁₆</strong>
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-[11px] text-[var(--text-muted)] text-right pt-0.5 font-semibold">
                Hexadezimal: 0x{Conversions.decToHex(currentDec, Math.ceil(bitCount / 4))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-center text-emerald-900 dark:text-emerald-200 font-semibold">
            Aktive Potenzen: {polynomialTerms.filter((t) => t.isActive).map((t) => t.val).join(" + ") || "0"} = <strong className="text-[var(--text-primary)]">{currentDec}₁₀</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
