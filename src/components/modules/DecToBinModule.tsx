"use client";

import React, { useState, useEffect, useCallback } from "react";
import { BitRow } from "@/components/ui/BitRow";
import { Conversions, StellenwertStep } from "@/lib/conversions";
import { Check, RefreshCw, Eye } from "lucide-react";

interface DecToBinModuleProps {
  onSuccess: () => void;
  onError: () => void;
  onPlayClick: () => void;
}

export function DecToBinModule({ onSuccess, onError, onPlayClick }: DecToBinModuleProps) {
  const [bitRange, setBitRange] = useState<4 | 8 | 16>(8);
  const [inputMode, setInputMode] = useState<"buttons" | "text">("buttons");
  const [targetDec, setTargetDec] = useState<number>(0);
  const [bits, setBits] = useState<number[]>(new Array(8).fill(0));
  const [textInput, setTextInput] = useState<string>("");
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [solutionSteps, setSolutionSteps] = useState<StellenwertStep[]>([]);

  // Generate random number based on range
  const generateNewTask = useCallback((range: 4 | 8 | 16 = bitRange) => {
    let max = 255;
    if (range === 4) max = 15;
    if (range === 16) max = 65535;

    let nextVal = Math.floor(Math.random() * (max + 1));
    // avoid 0 as sole task too often
    if (nextVal === 0 && max > 10) nextVal = Math.floor(Math.random() * max) + 1;

    setTargetDec(nextVal);
    setBits(new Array(range).fill(0));
    setTextInput("");
    setFeedback(null);
    setShowSolution(false);
    setSolutionSteps([]);
  }, [bitRange]);

  useEffect(() => {
    generateNewTask(bitRange);
  }, [bitRange, generateNewTask]);

  const currentSum = bits.reduce(
    (acc, bit, idx) => acc + (bit === 1 ? Math.pow(2, bits.length - 1 - idx) : 0),
    0
  );

  const checkAnswer = () => {
    let userBinary = "";
    if (inputMode === "buttons") {
      userBinary = bits.join("");
    } else {
      userBinary = textInput.replace(/\s+/g, "").padStart(bitRange, "0");
    }

    const targetBinary = Conversions.decToBin(targetDec, bitRange);
    const isCorrect = userBinary === targetBinary;

    if (isCorrect) {
      setFeedback({
        isCorrect: true,
        message: `Perfekt! ${targetDec} dezimal ist exakt ${Conversions.formatNibbles(targetBinary)} binär.`,
      });
      onSuccess();
    } else {
      const userDec = Conversions.binToDec(userBinary);
      setFeedback({
        isCorrect: false,
        message: `Noch nicht ganz: Deine Eingabe ergibt ${userDec} (Differenz: ${userDec - targetDec > 0 ? "+" : ""}${userDec - targetDec}).`,
      });
      onError();
    }
  };

  const handleRevealSolution = () => {
    onPlayClick();
    const steps = Conversions.getStellenwertSteps(targetDec, bitRange);
    setSolutionSteps(steps);
    setShowSolution(true);
  };

  return (
    <div className="space-y-6">
      {/* Steuerungsleiste: Bitbereich & Eingabemodus */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)]">Bereich:</span>
          {([4, 8, 16] as const).map((r) => (
            <button
              key={r}
              onClick={() => {
                onPlayClick();
                setBitRange(r);
              }}
              className={`text-xs px-3 py-1 rounded-lg border transition-all cursor-pointer font-mono ${
                bitRange === r
                  ? "bg-sky-500 text-white border-sky-400 font-bold"
                  : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
              }`}
            >
              {r}-Bit ({r === 4 ? "0–15" : r === 8 ? "0–255 (FiSi)" : "0–65535"})
            </button>
          ))}
        </div>

        {bitRange <= 8 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">Modus:</span>
            <button
              onClick={() => {
                onPlayClick();
                setInputMode("buttons");
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                inputMode === "buttons"
                  ? "bg-sky-500/20 text-sky-400 border-sky-500/40 font-semibold"
                  : "border-[var(--border-color)] text-[var(--text-secondary)]"
              }`}
            >
              Schalter
            </button>
            <button
              onClick={() => {
                onPlayClick();
                setInputMode("text");
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                inputMode === "text"
                  ? "bg-sky-500/20 text-sky-400 border-sky-500/40 font-semibold"
                  : "border-[var(--border-color)] text-[var(--text-secondary)]"
              }`}
            >
              Tastatur
            </button>
          </div>
        )}
      </div>

      {/* Aufgaben-Karte */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center shadow-sm">
        <span className="text-xs uppercase font-bold tracking-wider text-sky-400">Aufgabe</span>
        <h3 className="text-sm text-[var(--text-secondary)] mt-1">Wandle diese Dezimalzahl in Binär um:</h3>
        <div className="text-4xl sm:text-5xl font-mono font-bold text-[var(--text-primary)] my-3">
          {targetDec}
          <span className="text-sm font-normal text-[var(--text-muted)] ml-2">₁₀</span>
        </div>

        {/* Schalter-Eingabe */}
        {inputMode === "buttons" && bitRange <= 8 ? (
          <div className="my-5">
            <BitRow bits={bits} onChange={setBits} onBitClick={onPlayClick} />
            <div className="mt-3 text-xs font-mono text-[var(--text-secondary)]">
              Aktuelle Summe: <span className="font-bold text-[var(--text-primary)]">{currentSum}</span>
              {" | "}
              Ziel: <span className="font-bold text-sky-400">{targetDec}</span>
            </div>
          </div>
        ) : (
          /* Text-Eingabe */
          <div className="my-5 max-w-sm mx-auto">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value.replace(/[^01\s]/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
              placeholder={`${bitRange} Bits eingeben (z. B. 10100000)`}
              className="w-full text-center font-mono text-xl py-3 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-sky-400 transition-all"
            />
            <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
              💡 Leerzeichen zur Nibble-Trennung sind erlaubt. Drücke Enter zum Prüfen.
            </p>
          </div>
        )}

        {/* Aktionsleiste */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          <button
            onClick={checkAnswer}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-all cursor-pointer shadow-md shadow-sky-500/20"
          >
            <Check size={18} /> Prüfen
          </button>
          <button
            onClick={() => {
              onPlayClick();
              generateNewTask();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer"
          >
            <RefreshCw size={16} /> Neue Zahl
          </button>
          <button
            onClick={handleRevealSolution}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-sky-400 hover:border-sky-500/40 transition-all cursor-pointer text-xs"
          >
            <Eye size={16} /> Lösungsweg
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mt-5 p-3.5 rounded-xl text-sm font-medium border ${
              feedback.isCorrect
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/40 text-rose-400"
            }`}
          >
            {feedback.message}
          </div>
        )}
      </div>

      {/* Lösungsweg Aufklappbar */}
      {showSolution && solutionSteps.length > 0 && (
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
          <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-3">
            📖 Schritt-für-Schritt Stellenwertmethode für {targetDec}:
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)]">
                  <th className="py-2 text-left">Stelle (Potenz)</th>
                  <th className="py-2 text-center">Wert</th>
                  <th className="py-2 text-left">Passt in Rest?</th>
                  <th className="py-2 text-center">Bit</th>
                  <th className="py-2 text-right">Neuer Rest</th>
                </tr>
              </thead>
              <tbody>
                {solutionSteps.map((s, i) => (
                  <tr key={i} className="border-b border-[var(--border-color)]/30">
                    <td className="py-2 text-left text-sky-400">2<sup>{s.power}</sup></td>
                    <td className="py-2 text-center font-semibold">{s.val}</td>
                    <td className="py-2 text-left">
                      {s.prevRemainder} ≥ {s.val} ?{" "}
                      <span className={s.fits ? "text-emerald-400 font-bold" : "text-[var(--text-muted)]"}>
                        {s.fits ? "Ja (- " + s.val + ")" : "Nein"}
                      </span>
                    </td>
                    <td className="py-2 text-center font-bold text-base">
                      <span className={s.bit === 1 ? "text-sky-400" : "text-[var(--text-muted)]"}>
                        {s.bit}
                      </span>
                    </td>
                    <td className="py-2 text-right text-[var(--text-secondary)]">{s.newRemainder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-[var(--text-secondary)]">
            Ergebnis:{" "}
            <span className="font-mono font-bold text-sky-400">
              {Conversions.formatNibbles(Conversions.decToBin(targetDec, bitRange))}₂
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
