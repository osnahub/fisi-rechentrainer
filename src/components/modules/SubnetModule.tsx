"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SUBNET_TABLE, SubnetEntry } from "@/lib/subnetData";
import { Conversions } from "@/lib/conversions";
import { Check, RefreshCw, Eye, BookOpen, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface SubnetModuleProps {
  onSuccess?: () => void;
  onError?: () => void;
  onPlayClick?: () => void;
  onStreakUpdate?: (correct: boolean) => void;
}

type SubnetTaskType = "cidr2mask" | "mask2bin" | "magicNumber";

export function SubnetModule({
  onSuccess,
  onError,
  onStreakUpdate,
}: SubnetModuleProps) {
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
      case "cidr2mask": {
        expected = String(currentEntry.maskOctet);
        let parsedVal: number;
        if (raw.includes(".")) {
          const parts = raw.split(".").filter((p) => p.trim() !== "");
          const lastOctet = parts[parts.length - 1];
          parsedVal = /^\d+$/.test(lastOctet) ? parseInt(lastOctet, 10) : NaN;
        } else {
          parsedVal = /^\d+$/.test(raw) ? parseInt(raw, 10) : NaN;
        }
        isCorrect = parsedVal === currentEntry.maskOctet;
        break;
      }
      case "mask2bin":
        expected = currentEntry.binaryOctet;
        isCorrect = raw.replace(/\s+/g, "") === currentEntry.binaryOctet;
        break;
      case "magicNumber":
        expected = String(currentEntry.magicNumber);
        isCorrect = /^\d+$/.test(raw) && parseInt(raw, 10) === currentEntry.magicNumber;
        break;
    }

    if (isCorrect) {
      setFeedback({
        isCorrect: true,
        message: `Hervorragend! Richtig für ${currentEntry.cidr}: ${expected}.`,
      });
      onSuccess?.();
      onStreakUpdate?.(true);
    } else {
      setFeedback({
        isCorrect: false,
        message: `Leider falsch. Für ${currentEntry.cidr} lautet die richtige Antwort: ${expected}.`,
      });
      onError?.();
      onStreakUpdate?.(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Modus-Auswahl & Referenz-Button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[var(--text-secondary)] mr-1 hidden sm:inline">
            Übungsziel:
          </span>
          {(
            [
              { id: "cidr2mask", label: "CIDR ➔ Maske" },
              { id: "mask2bin", label: "Maske ➔ Binär" },
              { id: "magicNumber", label: "Schrittweite" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTaskType(t.id)}
              className={`text-xs px-2.5 sm:px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                taskType === t.id
                  ? "bg-sky-600 dark:bg-sky-500 text-white border-sky-600 dark:border-sky-400 font-semibold shadow-sm"
                  : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowFullTable((prev) => !prev)}
          className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 font-medium ${
            showFullTable
              ? "bg-sky-600 dark:bg-sky-500 text-white border-sky-600 dark:border-sky-400 shadow-sm"
              : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
          }`}
        >
          <BookOpen size={14} />
          <span>{showFullTable ? "Tabelle verbergen" : "IHK-Tabelle"}</span>
        </button>
      </div>

      {/* Aufgaben-Karte */}
      <div className="p-3.5 sm:p-8 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center shadow-sm relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-300 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles size={13} />
          <span>IHK-Prüfungsfrage</span>
        </div>

        {taskType === "cidr2mask" && (
          <div>
            <h2 className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
              Welcher Dezimalwert steht im 4. Oktett bei einem Subnetz mit Präfix:
            </h2>
            <div className="my-4 sm:my-6">
              <span className="text-5xl sm:text-6xl font-mono font-extrabold text-[var(--text-primary)]">
                {currentEntry.cidr}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)] block mt-2">
                Maske: 255.255.255.<strong>?</strong>
              </span>
            </div>
          </div>
        )}

        {taskType === "mask2bin" && (
          <div>
            <h2 className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
              Wie lautet das Subnetz-Oktett als 8-Bit-Muster (z. B. 11110000)?
            </h2>
            <div className="my-4 sm:my-6">
              <span className="text-5xl sm:text-6xl font-mono font-extrabold text-[var(--text-primary)]">
                .{currentEntry.maskOctet}
              </span>
              <span className="text-xs font-mono text-[var(--text-muted)] block mt-2">
                (Präfix {currentEntry.cidr})
              </span>
            </div>
          </div>
        )}

        {taskType === "magicNumber" && (
          <div>
            <h2 className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
              Wie groß ist die <strong>Schrittweite / Magic Number</strong> (256 - Maske)?
            </h2>
            <div className="my-4 sm:my-6">
              <span className="text-5xl sm:text-6xl font-mono font-extrabold text-[var(--text-primary)]">
                .{currentEntry.maskOctet}
              </span>
              <span className="text-xs font-mono text-sky-700 dark:text-sky-400 block mt-2 font-medium">
                {currentEntry.cidr} ➔ Formel: 256 - {currentEntry.maskOctet} = ?
              </span>
            </div>
          </div>
        )}

        {/* Eingabefeld (Mobile-Optimiert) */}
        <div className="max-w-xs mx-auto my-4 sm:my-6">
          <input
            type="text"
            inputMode="numeric"
            pattern={taskType === "mask2bin" ? "[01]*" : "[0-9]*"}
            autoComplete="off"
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
            className="w-full text-center font-mono text-2xl sm:text-3xl py-3 px-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20 transition-all"
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
            onClick={() => generateTask()}
            className="min-h-[42px] flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer text-xs font-medium"
          >
            <RefreshCw size={14} />
            <span>Nächste Aufgabe</span>
          </button>

          <button
            onClick={() => setShowSolution(true)}
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

      {/* Lösungsweg Details mit mathematischer Herleitung und IP-Bereich */}
      {showSolution && (
        <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] font-mono text-xs animate-pop-in space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 flex items-center justify-center text-xs">📖</span>
            <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
              Vollständiges Profil & mathematischer Beweis für {currentEntry.cidr}:
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Subnetzmaske</span>
              <span className="text-sm sm:text-base font-bold text-sky-700 dark:text-sky-400">255.255.255.{currentEntry.maskOctet}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Binärmuster (4. Oktett)</span>
              <span className="text-xs sm:text-sm font-bold text-sky-700 dark:text-sky-400">{currentEntry.binaryOctet}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Schrittweite (Blockgröße)</span>
              <span className="text-sm sm:text-base font-bold text-indigo-700 dark:text-indigo-300">{currentEntry.magicNumber} Adressen</span>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Nutzbare Hosts</span>
              <span className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">{currentEntry.usableHosts} Hosts</span>
            </div>
          </div>

          {/* Mathematische Herleitung */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
            <div className="text-sky-700 dark:text-sky-400 font-bold text-xs">
              Mathematische Herleitung der Schrittweite (Magic Number):
            </div>
            <div className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
              Bei einem <strong className="text-[var(--text-primary)]">{currentEntry.cidr}</strong>-Netzwerk verbleiben im 32-Bit-IPv4-Raum genau{" "}
              <strong className="text-sky-700 dark:text-sky-400">h = 32 - {parseInt(currentEntry.cidr.replace("/", ""), 10)} = {currentEntry.hostBits} Host-Bits</strong>.
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]/60 text-xs sm:text-sm font-bold text-[var(--text-primary)] overflow-x-auto">
              Schrittweite = 2ʰ = 2{currentEntry.hostBits === 0 ? "⁰" : currentEntry.hostBits === 1 ? "¹" : currentEntry.hostBits === 2 ? "²" : currentEntry.hostBits === 3 ? "³" : currentEntry.hostBits === 4 ? "⁴" : currentEntry.hostBits === 5 ? "⁵" : currentEntry.hostBits === 6 ? "⁶" : currentEntry.hostBits === 7 ? "⁷" : "^" + currentEntry.hostBits} = 256 - {currentEntry.maskOctet} = <span className="text-indigo-700 dark:text-indigo-300">{currentEntry.magicNumber}</span>
            </div>
            {currentEntry.hostBits > 1 ? (
              <div className="text-[11px] text-[var(--text-muted)]">
                Formel nutzbare Hosts: 2ʰ - 2 = {currentEntry.magicNumber} - 2 ={" "}
                <strong className="text-emerald-700 dark:text-emerald-400">{currentEntry.usableHosts}</strong> (Erste Adresse ist Netz-ID, letzte ist Broadcast).
              </div>
            ) : currentEntry.hostBits === 1 ? (
              <div className="text-[11px] text-[var(--text-muted)] space-y-1">
                <div>
                  <strong className="text-sky-700 dark:text-sky-400">Sonderfall RFC 3021 (Point-to-Point-Link):</strong> Beide Adressen ({currentEntry.magicNumber}) sind nutzbare Host-Schnittstellen. Keine getrennte Netz-ID / Broadcastadresse.
                </div>
                <div className="text-[10px] text-[var(--text-secondary)]">
                  💡 IHK-Prüfungshinweis: Nach klassischer Vor-RFC-3021-Formel (2¹ - 2 = 0) wären 0 Hosts nutzbar. Im modernen Netzwerkbetrieb (RFC 3021) sind es genau 2 Hosts.
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-[var(--text-muted)]">
                <strong className="text-sky-700 dark:text-sky-400">Sonderfall /32 (Host-Route / Loopback):</strong> Genau 1 Hostadresse (2⁰ = 1). Keine Netzwerk- oder Broadcast-Struktur vorhanden.
              </div>
            )}
          </div>

          {/* Praxisnahes IP-Beispiel */}
          {(() => {
            const cidrNum = parseInt(currentEntry.cidr.replace("/", ""), 10);
            const ex = Conversions.getSubnetExample(cidrNum);
            return (
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-2">
                <div className="text-indigo-800 dark:text-indigo-300 font-bold text-xs">
                  Typisches IHK-Prüfungsbeispiel (Basisnetz 192.168.10.0{currentEntry.cidr}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)] block">Netzwerkadresse (Netz-ID):</span>
                    <span className="font-bold text-[var(--text-primary)]">{ex.networkAddress}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)] block">Broadcastadresse:</span>
                    <span className="font-bold text-rose-700 dark:text-rose-400">{ex.broadcastAddress}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)] block">Erster nutzbarer Host:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{ex.firstHost}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)] block">Letzter nutzbarer Host:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{ex.lastHost}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="text-[var(--text-muted)] text-[11px]">
            Einsatzbereich: {currentEntry.notes}
          </div>
        </div>
      )}

      {/* Gesamte Referenztabelle – Vollständig scrollbalkenfrei auf Mobilgeräten */}
      {showFullTable && (
        <div className="p-3.5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] animate-pop-in">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
              📊 Die 9 magischen Werte der IPv4-Subnetzmasken (4. Oktett):
            </h3>
            <span className="text-[10px] text-[var(--text-muted)] font-mono sm:hidden">
              Mobile-Kartenansicht
            </span>
          </div>

          {/* Mobile Karten-Ansicht: 100% scrollbalkenfrei, perfekte Lesbarkeit auf jedem Smartphone */}
          <div className="block sm:hidden space-y-2">
            {SUBNET_TABLE.map((row) => {
              const isCurrent = row.cidr === currentEntry.cidr;
              return (
                <div
                  key={row.cidr}
                  className={`p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? "bg-sky-500/10 border-sky-500/40 shadow-sm ring-1 ring-sky-500/20"
                      : "bg-[var(--bg-card-subtle)] border-[var(--border-color)]/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-sky-700 dark:text-sky-400 font-mono">
                        {row.cidr}
                      </span>
                      <span className="text-xs font-semibold text-[var(--text-primary)] font-mono">
                        .{row.maskOctet}
                      </span>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">
                        (255.255.255.{row.maskOctet})
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                      {row.usableHosts} Hosts
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono py-1.5 border-y border-[var(--border-color)]/40 my-1">
                    <div>
                      <span className="text-[var(--text-muted)] text-[10px] block">Binärmuster:</span>
                      <span className="font-semibold text-[var(--text-secondary)]">{row.binaryOctet}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] text-[10px] block">Schrittweite (Block):</span>
                      <span className="font-bold text-indigo-700 dark:text-indigo-400">
                        {row.magicNumber} <span className="text-[10px] text-[var(--text-muted)] font-normal">(ges: {row.totalHosts})</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-[10.5px] text-[var(--text-muted)] mt-1.5 leading-snug">
                    💡 {row.notes}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Desktop & Tablet Tabellen-Ansicht */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-left">
                  <th className="py-2 px-2">CIDR</th>
                  <th className="py-2 px-2">Dezimal</th>
                  <th className="py-2 px-2">Binär</th>
                  <th className="py-2 px-2">Schrittweite</th>
                  <th className="py-2 px-2">Hosts (ges.)</th>
                  <th className="py-2 px-2">Nutzbar</th>
                  <th className="py-2 px-2">Einsatzzweck</th>
                </tr>
              </thead>
              <tbody>
                {SUBNET_TABLE.map((row) => (
                  <tr
                    key={row.cidr}
                    className={`border-b border-[var(--border-color)]/30 transition-colors ${
                      row.cidr === currentEntry.cidr ? "bg-sky-500/10 font-bold" : "hover:bg-[var(--bg-card-subtle)]"
                    }`}
                  >
                    <td className="py-2 px-2 text-sky-700 dark:text-sky-400 font-bold">{row.cidr}</td>
                    <td className="py-2 px-2 font-semibold text-[var(--text-primary)]">.{row.maskOctet}</td>
                    <td className="py-2 px-2">{row.binaryOctet}</td>
                    <td className="py-2 px-2 text-indigo-700 dark:text-indigo-400 font-semibold">{row.magicNumber}</td>
                    <td className="py-2 px-2">{row.totalHosts}</td>
                    <td className="py-2 px-2 text-emerald-700 dark:text-emerald-400 font-semibold">{row.usableHosts}</td>
                    <td className="py-2 px-2 text-[var(--text-muted)] text-[11px]">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
