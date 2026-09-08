"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Conversions } from "@/lib/conversions";
import { NIBBLE_TABLE } from "@/lib/subnetData";
import { Check, RefreshCw, Eye } from "lucide-react";

interface HexModuleProps {
  onSuccess: () => void;
  onError: () => void;
  onPlayClick: () => void;
}

type HexSubMode = "bin2hex" | "hex2bin" | "dec2hex" | "hex2dec";

export function HexModule({ onSuccess, onError, onPlayClick }: HexModuleProps) {
  const [subMode, setSubMode] = useState<HexSubMode>("bin2hex");
  const [taskVal, setTaskVal] = useState<number>(0); // 0-255 (1 Byte)
  const [userInput, setUserInput] = useState<string>("");
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showSolution, setShowSolution] = useState<boolean>(false);

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
        isCorrect = parseInt(raw, 10) === taskVal;
        break;
    }

    if (isCorrect) {
      setFeedback({
        isCorrect: true,
        message: `Exzellent! Das Ergebnis ist korrekt (${correctStr}).`,
      });
      onSuccess();
    } else {
      setFeedback({
        isCorrect: false,
        message: `Leider nicht richtig. Gesucht war: ${correctStr}. Prüfe den Rechenweg unten!`,
      });
      onError();
    }
  };

  return (
    <div className="space-y-6">
      {/* Modus-Auswahl */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
        <span className="text-xs font-semibold text-[var(--text-secondary)] mr-1">Modus:</span>
        {(
          [
            { id: "bin2hex", label: "Binär ➔ Hex (Nibble)" },
            { id: "hex2bin", label: "Hex ➔ Binär (Expansion)" },
            { id: "dec2hex", label: "Dezimal ➔ Hex" },
            { id: "hex2dec", label: "Hex ➔ Dezimal" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            onClick={() => {
              onPlayClick();
              setSubMode(m.id);
            }}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
              subMode === m.id
                ? "bg-sky-500 text-white border-sky-400 font-semibold"
                : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Aufgaben-Karte */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center shadow-sm">
        <span className="text-xs uppercase font-bold tracking-wider text-sky-400">Aufgabe</span>

        {subMode === "bin2hex" && (
          <div>
            <h3 className="text-sm text-[var(--text-secondary)] mt-1">
              Wandle dieses Byte mittels 4-Bit-Nibble-Methode in Hex um:
            </h3>
            <div className="flex justify-center items-center gap-4 my-6">
              <div className="p-3 sm:p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-sky-500/30">
                <span className="text-xs text-[var(--text-muted)] block mb-1">High-Nibble</span>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-sky-400">
                  {highNibbleBin}
                </span>
              </div>
              <div className="text-xl text-[var(--text-muted)] font-mono">+</div>
              <div className="p-3 sm:p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-indigo-500/30">
                <span className="text-xs text-[var(--text-muted)] block mb-1">Low-Nibble</span>
                <span className="font-mono text-2xl sm:text-3xl font-bold text-indigo-400">
                  {lowNibbleBin}
                </span>
              </div>
            </div>
          </div>
        )}

        {subMode === "hex2bin" && (
          <div>
            <h3 className="text-sm text-[var(--text-secondary)] mt-1">
              Wandle diesen Hex-Wert in ein 8-Bit-Muster um:
            </h3>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-[var(--text-primary)] my-4">
              0x{targetHex}
            </div>
          </div>
        )}

        {subMode === "dec2hex" && (
          <div>
            <h3 className="text-sm text-[var(--text-secondary)] mt-1">
              Wandle diese Dezimalzahl in Hexadezimal um:
            </h3>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-[var(--text-primary)] my-4">
              {taskVal}
              <span className="text-sm font-normal text-[var(--text-muted)] ml-2">₁₀</span>
            </div>
          </div>
        )}

        {subMode === "hex2dec" && (
          <div>
            <h3 className="text-sm text-[var(--text-secondary)] mt-1">
              Wandle diesen Hex-Wert in eine Dezimalzahl um:
            </h3>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-[var(--text-primary)] my-4">
              0x{targetHex}
            </div>
          </div>
        )}

        {/* Eingabe */}
        <div className="max-w-xs mx-auto my-4">
          <input
            type="text"
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
            className="w-full text-center font-mono text-2xl py-3 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-sky-400 transition-all uppercase"
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
              generateTask();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer"
          >
            <RefreshCw size={16} /> Neue Aufgabe
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

      {/* Lösungsweg & Nibble-Aufschlüsselung */}
      {showSolution && (
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
          <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-3">
            📖 Die Nibble-Methode im Detail:
          </h4>
          <div className="grid sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-sky-400 font-bold block mb-1">
                1. High-Nibble (obere 4 Bits):
              </span>
              <div>Binär: <span className="font-bold">{highNibbleBin}</span></div>
              <div>Dezimalwert: {Conversions.binToDec(highNibbleBin)}</div>
              <div className="text-sky-400 font-bold mt-1">➔ Hex-Ziffer: {highNibbleHex}</div>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-indigo-400 font-bold block mb-1">
                2. Low-Nibble (untere 4 Bits):
              </span>
              <div>Binär: <span className="font-bold">{lowNibbleBin}</span></div>
              <div>Dezimalwert: {Conversions.binToDec(lowNibbleBin)}</div>
              <div className="text-indigo-400 font-bold mt-1">➔ Hex-Ziffer: {lowNibbleHex}</div>
            </div>
          </div>
          <div className="mt-3 p-2 text-center font-mono text-sm font-bold text-sky-400 bg-sky-500/10 rounded-lg border border-sky-500/20">
            Gesamtergebnis: 0x{targetHex} = {taskVal}₁₀ = {highNibbleBin} {lowNibbleBin}₂
          </div>
        </div>
      )}
    </div>
  );
}
