"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SUBNET_TABLE, SubnetEntry } from "@/lib/subnetData";
import { Check, RefreshCw, Eye, BookOpen } from "lucide-react";

interface SubnetModuleProps {
  onSuccess: () => void;
  onError: () => void;
  onPlayClick: () => void;
}

type SubnetTaskType = "cidr2mask" | "mask2bin" | "magicNumber";

export function SubnetModule({ onSuccess, onError, onPlayClick }: SubnetModuleProps) {
  const [taskType, setTaskType] = useState<SubnetTaskType>("cidr2mask");
  const [currentEntry, setCurrentEntry] = useState<SubnetEntry>(SUBNET_TABLE[4]); // default /28
  const [userInput, setUserInput] = useState<string>("");
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [showFullTable, setShowFullTable] = useState<boolean>(false);

  const generateTask = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * SUBNET_TABLE.length);
    setCurrentEntry(SUBNET_TABLE[randomIndex]);
    setUserInput("");
    setFeedback(null);
    setShowSolution(false);
  }, []);

  useEffect(() => {
    generateTask();
  }, [taskType, generateTask]);

  const checkAnswer = () => {
    const raw = userInput.trim();
    let isCorrect = false;
    let expected = "";

    switch (taskType) {
      case "cidr2mask":
        expected = String(currentEntry.maskOctet);
        isCorrect = parseInt(raw, 10) === currentEntry.maskOctet;
        break;
      case "mask2bin":
        expected = currentEntry.binaryOctet;
        isCorrect = raw.replace(/\s+/g, "") === currentEntry.binaryOctet;
        break;
      case "magicNumber":
        expected = String(currentEntry.magicNumber);
        isCorrect = parseInt(raw, 10) === currentEntry.magicNumber;
        break;
    }

    if (isCorrect) {
      setFeedback({
        isCorrect: true,
        message: `Hervorragend! Richtig für ${currentEntry.cidr}: ${expected}.`,
      });
      onSuccess();
    } else {
      setFeedback({
        isCorrect: false,
        message: `Leider falsch. Für ${currentEntry.cidr} lautet die richtige Antwort: ${expected}.`,
      });
      onError();
    }
  };

  return (
    <div className="space-y-6">
      {/* Modus-Auswahl */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-secondary)]">Übungsziel:</span>
          {(
            [
              { id: "cidr2mask", label: "CIDR ➔ Subnetzmaske" },
              { id: "mask2bin", label: "Masken-Oktett ➔ Binär" },
              { id: "magicNumber", label: "Schrittweite (256 - Maske)" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onPlayClick();
                setTaskType(t.id);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
                taskType === t.id
                  ? "bg-sky-500 text-white border-sky-400 font-semibold"
                  : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            onPlayClick();
            setShowFullTable((prev) => !prev);
          }}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
            showFullTable
              ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
              : "border-[var(--border-color)] text-[var(--text-secondary)]"
          }`}
        >
          <BookOpen size={14} /> {showFullTable ? "Subnetztabelle verbergen" : "IHK-Subnetztabelle"}
        </button>
      </div>

      {/* Aufgaben-Karte */}
      <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center shadow-sm">
        <span className="text-xs uppercase font-bold tracking-wider text-sky-400">FiSi-Prüfungsfrage</span>

        {taskType === "cidr2mask" && (
          <div>
            <h3 className="text-sm text-[var(--text-secondary)] mt-1">
              Welcher Dezimalwert steht im 4. Oktett bei einem Subnetz mit Präfix:
            </h3>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-[var(--text-primary)] my-4">
              {currentEntry.cidr}
              <span className="text-xs font-normal text-[var(--text-muted)] block mt-1">
                Maske: 255.255.255.<strong>?</strong>
              </span>
            </div>
          </div>
        )}

        {taskType === "mask2bin" && (
          <div>
            <h3 className="text-sm text-[var(--text-secondary)] mt-1">
              Wie lautet das Subnetz-Oktett als 8-Bit-Muster (z. B. 11110000)?
            </h3>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-[var(--text-primary)] my-4">
              .{currentEntry.maskOctet}
              <span className="text-xs font-normal text-[var(--text-muted)] block mt-1">
                (Präfix {currentEntry.cidr})
              </span>
            </div>
          </div>
        )}

        {taskType === "magicNumber" && (
          <div>
            <h3 className="text-sm text-[var(--text-secondary)] mt-1">
              Wie groß ist die <strong>Schrittweite / Magic Number</strong> (256 - Maske) bei {currentEntry.cidr}?
            </h3>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-[var(--text-primary)] my-4">
              .{currentEntry.maskOctet}
              <span className="text-xs font-normal text-[var(--text-muted)] block mt-1">
                Formel: Schrittweite = 256 - Masken-Oktett
              </span>
            </div>
          </div>
        )}

        {/* Eingabe */}
        <div className="max-w-xs mx-auto my-4">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
            placeholder={
              taskType === "cidr2mask"
                ? "z. B. 240"
                : taskType === "mask2bin"
                ? "z. B. 11110000"
                : "z. B. 16"
            }
            className="w-full text-center font-mono text-2xl py-3 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-sky-400 transition-all"
          />
        </div>

        {/* Buttons */}
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
            <RefreshCw size={16} /> Nächste Aufgabe
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

      {/* Lösungsweg Details */}
      {showSolution && (
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs font-mono">
          <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-3">
            📖 Vollständiges Profil für {currentEntry.cidr}:
          </h4>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[var(--text-muted)] block">Subnetzmaske</span>
              <span className="text-base font-bold text-sky-400">255.255.255.{currentEntry.maskOctet}</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[var(--text-muted)] block">Binärmuster</span>
              <span className="text-base font-bold text-sky-400">{currentEntry.binaryOctet}</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[var(--text-muted)] block">Schrittweite</span>
              <span className="text-base font-bold text-indigo-400">{currentEntry.magicNumber} Adressen</span>
            </div>
            <div className="p-3 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[var(--text-muted)] block">Nutzbare Hosts</span>
              <span className="text-base font-bold text-emerald-400">{currentEntry.usableHosts} Hosts</span>
            </div>
          </div>
          <div className="mt-3 text-[var(--text-muted)]">
            Info: {currentEntry.notes} (Host-Bits: {currentEntry.hostBits})
          </div>
        </div>
      )}

      {/* Gesamte Referenztabelle */}
      {showFullTable && (
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] overflow-x-auto">
          <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-3">
            📊 Die 9 magischen Werte der IPv4-Subnetzmasken:
          </h4>
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-left">
                <th className="py-2">CIDR</th>
                <th className="py-2">Dezimal</th>
                <th className="py-2">Binär</th>
                <th className="py-2">Schrittweite</th>
                <th className="py-2">Hosts (ges.)</th>
                <th className="py-2">Nutzbar</th>
                <th className="py-2">Einsatzzweck</th>
              </tr>
            </thead>
            <tbody>
              {SUBNET_TABLE.map((row) => (
                <tr
                  key={row.cidr}
                  className={`border-b border-[var(--border-color)]/30 ${
                    row.cidr === currentEntry.cidr ? "bg-sky-500/10 font-bold" : ""
                  }`}
                >
                  <td className="py-2 text-sky-400">{row.cidr}</td>
                  <td className="py-2">{row.maskOctet}</td>
                  <td className="py-2">{row.binaryOctet}</td>
                  <td className="py-2 text-indigo-400">{row.magicNumber}</td>
                  <td className="py-2">{row.totalHosts}</td>
                  <td className="py-2 text-emerald-400">{row.usableHosts}</td>
                  <td className="py-2 text-[var(--text-muted)]">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
