"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Conversions } from "@/lib/conversions";
import { Check, RefreshCw, Eye } from "lucide-react";

interface BinToDecModuleProps {
  onSuccess: () => void;
  onError: () => void;
  onPlayClick: () => void;
}

export function BinToDecModule({ onSuccess, onError, onPlayClick }: BinToDecModuleProps) {
  const [bitRange, setBitRange] = useState<4 | 8 | 16>(8);
  const [targetBinary, setTargetBinary] = useState<string>("00000000");
  const [showPowersHelper, setShowPowersHelper] = useState<boolean>(false);
  const [userDecInput, setUserDecInput] = useState<string>("");
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  const generateNewTask = useCallback((range: 4 | 8 | 16 = bitRange) => {
    let max = 255;
    if (range === 4) max = 15;
    if (range === 16) max = 65535;

    let val = Math.floor(Math.random() * (max + 1));
    if (val === 0 && max > 10) val = Math.floor(Math.random() * max) + 1;

    setTargetBinary(Conversions.decToBin(val, range));
    setUserDecInput("");
    setFeedback(null);
    setShowSolution(false);
  }, [bitRange]);

  useEffect(() => {
    generateNewTask(bitRange);
  }, [bitRange, generateNewTask]);

  const targetDec = Conversions.binToDec(targetBinary);
  const bitArray = targetBinary.split("").map(Number);

  const checkAnswer = () => {
    const val = parseInt(userDecInput.trim(), 10);
    if (isNaN(val)) {
      setFeedback({ isCorrect: false, message: "Bitte eine gültige Dezimalzahl eingeben." });
      onError();
      return;
    }

    if (val === targetDec) {
      setFeedback({
        isCorrect: true,
        message: `Richtig! ${Conversions.formatNibbles(targetBinary)}₂ entspricht ${targetDec}₁₀.`,
      });
      onSuccess();
    } else {
      setFeedback({
        isCorrect: false,
        message: `Leider falsch: ${val} ist nicht korrekt. Versuche es noch einmal oder wirf einen Blick auf den Lösungsweg.`,
      });
      onError();
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

  return (
    <div className="space-y-6">
      {/* Steuerungsleiste */}
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
              {r}-Bit ({r === 4 ? "0–15" : r === 8 ? "0–255" : "0–65535"})
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            onPlayClick();
            setShowPowersHelper((prev) => !prev);
          }}
          className={`text-xs px-3 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
            showPowersHelper
              ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
              : "border-[var(--border-color)] text-[var(--text-secondary)]"
          }`}
        >
          {showPowersHelper ? "Stellenwerte ausblenden" : "Stellenwerte einblenden 💡"}
        </button>
      </div>

      {/* Aufgaben-Karte */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center shadow-sm">
        <span className="text-xs uppercase font-bold tracking-wider text-sky-400">Aufgabe</span>
        <h3 className="text-sm text-[var(--text-secondary)] mt-1">
          Wandle dieses Bitmuster in die Dezimalzahl um:
        </h3>

        {/* Visuelle Bit-Anzeige */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 my-6">
          {bitArray.map((bit, idx) => {
            const power = bitArray.length - 1 - idx;
            const powerVal = Math.pow(2, power);
            const isOn = bit === 1;

            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span
                  className={`text-[11px] font-mono transition-opacity ${
                    showPowersHelper
                      ? isOn
                        ? "text-sky-400 font-bold opacity-100"
                        : "text-[var(--text-muted)] opacity-50"
                      : "opacity-0"
                  }`}
                >
                  {powerVal}
                </span>
                <div
                  className={`w-10 h-12 sm:w-12 sm:h-14 rounded-xl font-mono text-lg sm:text-xl font-bold border flex items-center justify-center select-none transition-all ${
                    isOn
                      ? "bg-sky-600/30 border-sky-400 text-sky-300 shadow-md shadow-sky-500/20"
                      : "bg-[var(--bg-input)] border-[var(--border-color)] text-[var(--text-muted)]"
                  }`}
                >
                  {bit}
                </div>
              </div>
            );
          })}
        </div>

        {/* Eingabefeld für Dezimalwert */}
        <div className="max-w-xs mx-auto my-4">
          <input
            type="number"
            min="0"
            value={userDecInput}
            onChange={(e) => setUserDecInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
            placeholder="Dezimalzahl eingeben (z. B. 168)"
            className="w-full text-center font-mono text-2xl py-3 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-sky-400 transition-all"
          />
        </div>

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
            <RefreshCw size={16} /> Neues Muster
          </button>
          <button
            onClick={() => {
              onPlayClick();
              setShowSolution(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-sky-400 hover:border-sky-500/40 transition-all cursor-pointer text-xs"
          >
            <Eye size={16} /> Lösungsweg
          </button>
        </div>

        {/* Feedback */}
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

      {/* Lösungsweg */}
      {showSolution && (
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
          <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-2">
            📖 Mathematische Addition der gesetzten 1-Bits:
          </h4>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            Jede gesetzte Eins repräsentiert ihre Zweierpotenz. Addiere alle Werte:
          </p>
          <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] font-mono text-sm border border-[var(--border-color)]">
            {activePowers.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <span>
                  {activePowers.map((p) => `${p.val} (2^${p.power})`).join(" + ")}
                </span>
                <span className="font-bold text-sky-400">= {targetDec}₁₀</span>
              </div>
            ) : (
              <span>Kein Bit gesetzt = 0</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
