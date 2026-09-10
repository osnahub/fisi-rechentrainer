"use client";

import React, { useState } from "react";
import { Conversions, MAX_UINT32 } from "@/lib/conversions";
import { ArrowUp, Calculator, AlertCircle } from "lucide-react";

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

  // Safe parsing with domain error feedback
  let currentDec = 0;
  let parseError: string | null = null;

  if (format === "dec") {
    const res = Conversions.parseDecimalInput(inputValue);
    if (res.ok) {
      currentDec = res.value;
    } else {
      parseError = res.error;
    }
  } else if (format === "bin") {
    const res = Conversions.parseBinaryInput(inputValue);
    if (res.ok) {
      currentDec = res.value.value;
    } else {
      parseError = res.error;
    }
  }

  // Calculate bit count dynamically (8, 16, or 32 bits, clamped to max 32 bits)
  const bitCount =
    format === "bin" && !parseError
      ? Math.max(8, Math.ceil(inputValue.replace(/\s+/g, "").length / 4) * 4)
      : currentDec > 65535
      ? 32
      : currentDec > 255
      ? 16
      : 8;

  let currentBin = "0".repeat(bitCount);
  let stellenwertSteps: ReturnType<typeof Conversions.getStellenwertSteps> = [];
  let divisionSteps: ReturnType<typeof Conversions.getDivisionSteps> = [];
  let polynomialTerms: ReturnType<typeof Conversions.getPolynomialExpansion> = [];
  let activeBitsCount = 0;

  if (!parseError) {
    try {
      currentBin = Conversions.decToBin(currentDec, bitCount);
      stellenwertSteps = Conversions.getStellenwertSteps(currentDec, bitCount);
      divisionSteps = Conversions.getDivisionSteps(currentDec);
      polynomialTerms = Conversions.getPolynomialExpansion(currentBin);
      activeBitsCount = currentBin.split("").filter((b) => b === "1").length;
    } catch (err: unknown) {
      parseError = err instanceof Error ? err.message : "Berechnungsfehler";
    }
  }

  // Calculate dynamic 4-bit nibbles
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (format === "bin") {
      // Nur 0, 1 und Leerzeichen erlauben; maximal 32 Bits zulassen
      const filtered = raw.replace(/[^01\s]/g, "");
      let bitCount = 0;
      let result = "";
      for (const ch of filtered) {
        if (ch === "0" || ch === "1") {
          if (bitCount < 32) {
            result += ch;
            bitCount++;
          }
        } else {
          result += ch;
        }
      }
      setInputValue(result);
    } else {
      // Nur Ziffern erlauben; maximal 10 Stellen (4294967295)
      const digits = raw.replace(/[^0-9]/g, "").slice(0, 10);
      setInputValue(digits);
    }
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
                Universeller Rechenhelfer (32-Bit Unsigned)
              </h2>
              <p className="text-[11px] text-[var(--text-muted)]">
                Bereich 0 bis {MAX_UINT32} (1 bis 32 Bit)
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
                type="button"
                onClick={() => {
                  setFormat(f.id);
                  if (f.id === "dec") setInputValue(String(currentDec));
                  if (f.id === "bin") setInputValue(currentBin);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                  format === f.id
                    ? "bg-[var(--primary-btn-bg)] text-white font-semibold shadow-sm"
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
          <label htmlFor="explainer-number-input" className="block text-xs font-semibold text-[var(--text-secondary)] mb-2 text-center">
            {format === "dec"
              ? `Dezimalzahl eingeben (0 bis ${MAX_UINT32}):`
              : "Binärmuster eingeben (1 bis 32 Bit):"}
          </label>
          <input
            id="explainer-number-input"
            type="text"
            inputMode="numeric"
            pattern={format === "bin" ? "[01\\s]*" : "[0-9]*"}
            autoCorrect="off"
            spellCheck="false"
            maxLength={format === "bin" ? 39 : 10}
            value={inputValue}
            onChange={handleInputChange}
            placeholder={
              format === "dec" ? "z. B. 173 oder 65535" : "z. B. 10101101"
            }
            aria-describedby="explainer-hint"
            className="w-full text-center font-mono text-2xl sm:text-3xl py-3 px-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
          <p id="explainer-hint" className="sr-only">
            Geben Sie eine Zahl ein, um Rechenwege zu sehen.
          </p>

          {parseError && (
            <div
              role="alert"
              className="mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center justify-center gap-1.5"
            >
              <AlertCircle size={15} className="shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            <span className="text-[11px] text-[var(--text-muted)] mr-1">Prüfungs-Beispiele:</span>
            {[0, 42, 128, 255, 65535, 4294967295].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setPreset(preset)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card-subtle)] text-[var(--text-secondary)] hover:border-sky-500 hover:text-sky-700 dark:hover:text-sky-300 transition-all cursor-pointer font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Schnellübersicht der Formate (Dezimal, Binär, Hexadezimal, Bit-Status) */}
        {!parseError && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mt-6 pt-5 border-t border-[var(--border-color)] font-mono text-center">
            <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[11px] text-[var(--text-muted)] block">Dezimalsystem (Basis 10)</span>
              <span className="text-base sm:text-lg font-bold text-[var(--text-primary)]">{currentDec}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[11px] text-[var(--text-muted)] block">Dualsystem ({bitCount}-Bit)</span>
              <span className="text-base sm:text-lg font-bold text-sky-700 dark:text-sky-400">
                {Conversions.formatNibbles(currentBin)}₂
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[11px] text-[var(--text-muted)] block">Hexadezimal (Basis 16)</span>
              <span className="text-base sm:text-lg font-bold text-indigo-700 dark:text-indigo-400">
                0x{Conversions.decToHex(currentDec, Math.ceil(bitCount / 4))}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[11px] text-[var(--text-muted)] block">Bit-Status (1-Bits)</span>
              <span className="text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {activeBitsCount} / {bitCount} gesetzt
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Die 3 didaktischen Rechenwege */}
      {!parseError && (
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
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                Schnellste Kopfrechenmethode: Passt die Zweierpotenz in den Rest?
              </p>

              <table className="w-full text-xs font-mono border-collapse">
                <caption className="sr-only">Stellenwertmethode für {currentDec}</caption>
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-left">
                    <th scope="col" className="py-1 px-1">Potenz</th>
                    <th scope="col" className="py-1 px-1">Wert</th>
                    <th scope="col" className="py-1 px-1 text-center">Bit</th>
                    <th scope="col" className="py-1 px-1 text-right">Rest</th>
                  </tr>
                </thead>
                <tbody>
                  {stellenwertSteps.map((s, idx) => (
                    <tr key={idx} className={`border-b border-[var(--border-color)]/20 ${s.fits ? "bg-emerald-500/10" : ""}`}>
                      <td className="py-1 px-1 text-sky-700 dark:text-sky-400 font-medium whitespace-nowrap">
                        2^{s.power}
                        {idx === 0 && <span className="ml-1 text-[9px] text-amber-900 bg-amber-200 dark:text-amber-200 dark:bg-amber-950 px-1 py-0.5 rounded font-bold">MSB</span>}
                        {idx === stellenwertSteps.length - 1 && <span className="ml-1 text-[9px] text-indigo-900 bg-indigo-200 dark:text-indigo-200 dark:bg-indigo-950 px-1 py-0.5 rounded font-bold">LSB</span>}
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

            <div className="mt-4 p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-800 dark:text-sky-200 font-mono text-center font-semibold">
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
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                Klassische Papiermethode: Fortlaufend durch 2 teilen und Reste sammeln.
              </p>

              <div className="space-y-1 text-xs font-mono max-h-[380px] overflow-y-auto pr-1">
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
                        <span className="text-[9px] bg-indigo-200 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200 px-1 py-0.5 rounded border border-indigo-400 dark:border-indigo-700 font-bold">
                          LSB
                        </span>
                      )}
                      {step.isMSB && (
                        <span className="text-[9px] bg-amber-200 text-amber-900 dark:bg-amber-950 dark:text-amber-200 px-1 py-0.5 rounded border border-amber-400 dark:border-amber-700 font-bold">
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
                <ArrowUp size={16} className="shrink-0" />
                <span>Leserichtung: Von unten (MSB) nach oben (LSB)</span>
              </div>
              <div className="font-mono text-[11px] text-[var(--text-secondary)]">
                Endergebnis: <span className="text-emerald-700 dark:text-emerald-400 font-bold">{Conversions.formatNibbles(currentBin)}₂</span>
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
                  Polynom- &amp; Potenzdarstellung
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                Mathematischer Beweis über Stellenwert-Polynome zur Basis 2.
              </p>

              <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] font-mono text-[11px] space-y-2 mb-3">
                <div className="text-[var(--text-muted)] text-[10px]">Formel: N₁₀ = ∑ (bᵢ · 2ⁱ)</div>
                <div className="flex flex-wrap gap-1 leading-relaxed max-h-[140px] overflow-y-auto">
                  {polynomialTerms.map((term, idx) => (
                    <React.Fragment key={term.power}>
                      <span
                        className={`px-1 rounded border ${
                          term.isActive
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-700 font-bold"
                            : "bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-muted)]"
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
                <div className="text-xs text-sky-700 dark:text-sky-400 font-bold">
                  4-Bit-Nibbles ({nibbleList.length} Gruppe{nibbleList.length > 1 ? "n" : ""}):
                </div>
                <div className="space-y-1 max-h-[140px] overflow-y-auto">
                  {nibbleList.map((n, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-[var(--text-secondary)] flex items-center justify-between border-b border-[var(--border-color)]/30 pb-0.5 last:border-b-0"
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
                <div className="text-xs text-[var(--text-muted)] text-right pt-0.5 font-semibold">
                  Hexadezimal: 0x{Conversions.decToHex(currentDec, Math.ceil(bitCount / 4))}
                </div>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono text-center text-emerald-900 dark:text-emerald-200 font-semibold">
              Aktive Potenzen: {polynomialTerms.filter((t) => t.isActive).map((t) => t.val).join(" + ") || "0"} = <strong className="text-[var(--text-primary)]">{currentDec}₁₀</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
