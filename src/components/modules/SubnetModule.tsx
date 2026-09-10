"use client";

import React, { useState } from "react";
import { SUBNET_TABLE, SubnetEntry, isValidSubnetMaskAnswer } from "@/lib/subnetData";
import { Conversions } from "@/lib/conversions";
import { Sparkles, BookOpen, Network, Binary, Compass } from "lucide-react";
import { useExerciseState } from "@/hooks/useExerciseState";
import { ModeTabs, TabItem } from "@/components/ui/ModeTabs";
import { FeedbackMessage } from "@/components/ui/FeedbackMessage";
import { ExerciseActions } from "@/components/ui/ExerciseActions";

export type SubnetTaskType = "cidr2mask" | "mask2bin" | "magicNumber";

interface SubnetModuleProps {
  taskType?: SubnetTaskType;
  onTaskTypeChange?: (type: SubnetTaskType) => void;
  rng?: () => number;
}

export function SubnetModule({
  taskType: externalTaskType,
  onTaskTypeChange,
  rng,
}: SubnetModuleProps) {
  const [internalTaskType, setInternalTaskType] = useState<SubnetTaskType>("cidr2mask");
  const taskType = externalTaskType || internalTaskType;
  const setTaskType = (t: SubnetTaskType) => {
    if (onTaskTypeChange) onTaskTypeChange(t);
    else setInternalTaskType(t);
  };

  const [showFullTable, setShowFullTable] = useState<boolean>(false);

  const exercise = useExerciseState<SubnetEntry>({
    generator: (prev, customRng) => {
      const getR = customRng || rng || Math.random;
      let nextIdx = Math.floor(getR() * SUBNET_TABLE.length);
      let entry = SUBNET_TABLE[nextIdx];
      while (prev && entry.cidr === prev.cidr) {
        nextIdx = Math.floor(getR() * SUBNET_TABLE.length);
        entry = SUBNET_TABLE[nextIdx];
      }
      return entry;
    },
    validator: (input, target) => {
      const raw = input.trim();
      switch (taskType) {
        case "cidr2mask":
          return isValidSubnetMaskAnswer(raw, target.maskOctet);
        case "mask2bin":
          return raw.replace(/\s+/g, "") === target.binaryOctet;
        case "magicNumber":
          return /^\d+$/.test(raw) && parseInt(raw, 10) === target.magicNumber;
      }
    },
    getSuccessMessage: (target) => {
      return `Hervorragend! Richtig gelöst für ${target.cidr}.`;
    },
    getErrorMessage: () => {
      return "Leider nicht richtig. Überprüfe die Werte und versuche es erneut!";
    },
    getHint: (_input, target, attemptCount) => {
      if (attemptCount === 1) {
        switch (taskType) {
          case "cidr2mask":
            return `💡 Hinweis: Für ${target.cidr} verbleiben ${target.hostBits} Host-Bits. Die Maske ist 256 - 2^${target.hostBits} (oder 255.255.255.X).`;
          case "mask2bin":
            return `💡 Hinweis: Das Oktett .${target.maskOctet} besteht aus ${target.prefixLen - 24} Einsen gefolgt von Nullen.`;
          case "magicNumber":
            return `💡 Hinweis: Formel Schrittweite = 256 - Maskenwert (.${target.maskOctet}) = 2^${target.hostBits}.`;
        }
      }
      return null;
    },
    rng,
  });

  const currentEntry = exercise.target;

  const subnetTabs: TabItem<SubnetTaskType>[] = [
    { id: "cidr2mask", label: "CIDR ➔ Maske", fullLabel: "CIDR ➔ Maske", icon: Network },
    { id: "mask2bin", label: "Maske ➔ Binär", fullLabel: "Maske ➔ Binär", icon: Binary },
    { id: "magicNumber", label: "Schrittweite", fullLabel: "Schrittweite", icon: Compass },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Modus-Auswahl & Referenz-Button */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
        <ModeTabs
          tabs={subnetTabs}
          activeTab={taskType}
          onChange={(newType) => {
            setTaskType(newType);
            exercise.nextTask();
          }}
          ariaLabel="Subnetz Übungsziele"
          size="sm"
          className="flex-1"
        />

        <button
          type="button"
          onClick={() => setShowFullTable((prev) => !prev)}
          aria-expanded={showFullTable}
          aria-controls="subnet-table-panel"
          className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
            showFullTable
              ? "bg-[var(--primary-btn-bg)] text-white border-[var(--primary-btn-bg)] shadow-sm"
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

        {/* Eingabefeld mit sichtbarem Label */}
        <div className="max-w-xs mx-auto my-4 sm:my-6">
          <label htmlFor="subnet-user-input" className="block text-xs font-semibold text-[var(--text-secondary)] mb-2">
            {taskType === "cidr2mask"
              ? "Dezimalwert oder Vollmaske:"
              : taskType === "mask2bin"
              ? "8-Bit-Muster:"
              : "Schrittweite:"}
          </label>
          <input
            id="subnet-user-input"
            type="text"
            inputMode={taskType === "mask2bin" ? "numeric" : "text"}
            autoComplete="off"
            value={exercise.userInput}
            onChange={(e) => exercise.setUserInput(e.target.value)}
            onKeyDown={exercise.handleKeyDown}
            placeholder={
              taskType === "cidr2mask"
                ? "z. B. 128 oder 255.255.255.128"
                : taskType === "mask2bin"
                ? "z. B. 10000000"
                : "z. B. 128"
            }
            aria-describedby="subnet-user-hint"
            className="w-full text-center font-mono text-2xl sm:text-3xl py-3 px-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
          <p id="subnet-user-hint" className="text-[11px] text-[var(--text-muted)] mt-2">
            {taskType === "cidr2mask"
              ? "Akzeptiert: 4. Oktett (z.B. 128) oder vollständige Maske 255.255.255.128"
              : "Drücke Enter zum Prüfen."}
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

      {/* Lösungsweg Details mit mathematischer Herleitung und IP-Bereich */}
      {(exercise.solutionRevealed || exercise.status === "revealed") && (
        <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] font-mono text-xs animate-pop-in space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-700 dark:text-sky-300 flex items-center justify-center text-xs">📖</span>
            <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
              Vollständiges Profil &amp; mathematischer Beweis für {currentEntry.cidr}:
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[11px] text-[var(--text-muted)] block">Subnetzmaske</span>
              <span className="text-sm sm:text-base font-bold text-sky-700 dark:text-sky-400">255.255.255.{currentEntry.maskOctet}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[11px] text-[var(--text-muted)] block">Binärmuster (4. Oktett)</span>
              <span className="text-xs sm:text-sm font-bold text-sky-700 dark:text-sky-400">{currentEntry.binaryOctet}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[11px] text-[var(--text-muted)] block">Schrittweite (Blockgröße)</span>
              <span className="text-sm sm:text-base font-bold text-indigo-700 dark:text-indigo-400">{currentEntry.magicNumber} Adressen</span>
            </div>
            <div className="p-3 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[11px] text-[var(--text-muted)] block">Nutzbare Hosts</span>
              <span className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">{currentEntry.usableHosts} Hosts</span>
            </div>
          </div>

          {/* Mathematische Herleitung */}
          <div className="p-3.5 rounded-2xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)] space-y-1.5">
            <div className="text-sky-700 dark:text-sky-400 font-bold text-xs">
              Mathematische Herleitung der Schrittweite (Magic Number):
            </div>
            <div className="text-[var(--text-secondary)] text-xs leading-relaxed">
              Bei einem <strong className="text-[var(--text-primary)]">{currentEntry.cidr}</strong>-Netzwerk verbleiben im 32-Bit-IPv4-Raum genau{" "}
              <strong className="text-sky-700 dark:text-sky-400">h = 32 - {currentEntry.prefixLen} = {currentEntry.hostBits} Host-Bits</strong>.
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]/60 text-xs sm:text-sm font-bold text-[var(--text-primary)] overflow-x-auto">
              Schrittweite = 2ʰ = 2{currentEntry.hostBits === 0 ? "⁰" : currentEntry.hostBits === 1 ? "¹" : currentEntry.hostBits === 2 ? "²" : currentEntry.hostBits === 3 ? "³" : currentEntry.hostBits === 4 ? "⁴" : currentEntry.hostBits === 5 ? "⁵" : currentEntry.hostBits === 6 ? "⁶" : currentEntry.hostBits === 7 ? "⁷" : "^" + currentEntry.hostBits} = 256 - {currentEntry.maskOctet} = <span className="text-indigo-700 dark:text-indigo-400">{currentEntry.magicNumber}</span>
            </div>
            {currentEntry.hostBits > 1 ? (
              <div className="text-xs text-[var(--text-muted)]">
                Formel nutzbare Hosts: 2ʰ - 2 = {currentEntry.magicNumber} - 2 ={" "}
                <strong className="text-emerald-700 dark:text-emerald-400">{currentEntry.usableHosts}</strong> (Erste Adresse ist Netz-ID, letzte ist Broadcast).
              </div>
            ) : currentEntry.hostBits === 1 ? (
              <div className="text-xs text-[var(--text-muted)] space-y-1">
                <div>
                  <strong className="text-sky-700 dark:text-sky-400">Sonderfall RFC 3021 (Point-to-Point-Link):</strong> Beide Adressen ({currentEntry.magicNumber}) sind nutzbare Host-Schnittstellen. Keine getrennte Netz-ID / Broadcastadresse.
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  💡 IHK-Prüfungshinweis: Nach klassischer Vor-RFC-3021-Formel (2¹ - 2 = 0) wären 0 Hosts nutzbar. Im modernen Netzwerkbetrieb (RFC 3021) sind es genau 2 Hosts.
                </div>
              </div>
            ) : (
              <div className="text-xs text-[var(--text-muted)]">
                <strong className="text-sky-700 dark:text-sky-400">Sonderfall /32 (Host-Route):</strong> Genau 1 adressierte IP-Adresse (2⁰ = 1). Keine Netzwerk- oder Broadcast-Struktur vorhanden.
              </div>
            )}
          </div>

          {/* Praxisnahes IP-Beispiel */}
          {(() => {
            const ex = Conversions.getSubnetExample(currentEntry.prefixLen);
            return (
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-2">
                <div className="text-indigo-800 dark:text-indigo-300 font-bold text-xs">
                  Typisches IHK-Prüfungsbeispiel (Basisnetz 192.168.10.0{currentEntry.cidr}):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)] text-[11px] block">Netzwerkadresse (Netz-ID):</span>
                    <span className="font-bold text-[var(--text-primary)]">{ex.networkAddress}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)] text-[11px] block">Broadcastadresse:</span>
                    <span className="font-bold text-rose-700 dark:text-rose-400">{ex.broadcastAddress}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)] text-[11px] block">Erster nutzbarer Host:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{ex.firstHost}</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-color)]">
                    <span className="text-[var(--text-muted)] text-[11px] block">Letzter nutzbarer Host:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{ex.lastHost}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          <div className="text-[var(--text-muted)] text-xs">
            Einsatzbereich: {currentEntry.notes}
          </div>
        </div>
      )}

      {/* Gesamte Referenztabelle */}
      {showFullTable && (
        <div id="subnet-table-panel" className="p-3.5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-color)] animate-pop-in">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
              📊 Die 9 magischen Werte der IPv4-Subnetzmasken (/24 bis /32):
            </h3>
            <span className="text-[11px] text-[var(--text-muted)] font-mono sm:hidden">
              Mobile-Kartenansicht
            </span>
          </div>

          {/* Mobile Karten-Ansicht */}
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
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">
                        (255.255.255.{row.maskOctet})
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                      {row.usableHosts} Hosts
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono py-1.5 border-y border-[var(--border-color)]/40 my-1">
                    <div>
                      <span className="text-[var(--text-muted)] text-[10px] block">Binärmuster:</span>
                      <span className="font-semibold text-[var(--text-secondary)]">{row.binaryOctet}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] text-[10px] block">Schrittweite:</span>
                      <span className="font-bold text-indigo-700 dark:text-indigo-400">
                        {row.magicNumber} <span className="text-[10px] text-[var(--text-muted)] font-normal">(ges: {row.totalAddresses})</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-snug">
                    💡 {row.notes}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Desktop & Tablet Tabellen-Ansicht */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <caption className="sr-only">IPv4 Subnetzmasken Übersicht (/24 bis /32)</caption>
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)] text-left">
                  <th scope="col" className="py-2 px-2">CIDR</th>
                  <th scope="col" className="py-2 px-2">Dezimal</th>
                  <th scope="col" className="py-2 px-2">Binär</th>
                  <th scope="col" className="py-2 px-2">Schrittweite</th>
                  <th scope="col" className="py-2 px-2">Adressen gesamt</th>
                  <th scope="col" className="py-2 px-2">Nutzbar</th>
                  <th scope="col" className="py-2 px-2">Einsatzzweck</th>
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
                    <td className="py-2 px-2">{row.totalAddresses}</td>
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
