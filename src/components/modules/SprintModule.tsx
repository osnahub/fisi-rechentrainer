"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Conversions } from "@/lib/conversions";
import { SUBNET_TABLE } from "@/lib/subnetData";
import confetti from "canvas-confetti";
import { Timer, Zap, Trophy, RotateCcw, Check, ArrowRight } from "lucide-react";

interface SprintModuleProps {
  onSuccess: () => void;
  onError: () => void;
  onPlayClick: () => void;
  onPlayTrophy: () => void;
}

interface SprintQuestion {
  id: number;
  type: string;
  questionText: string;
  expectedAnswer: string;
  explanation: string;
  category: "dec2bin" | "bin2dec" | "subnet" | "hex";
}

export function SprintModule({
  onSuccess,
  onError,
  onPlayClick,
  onPlayTrophy,
}: SprintModuleProps) {
  const [gameState, setGameState] = useState<"idle" | "running" | "finished">("idle");
  const [questions, setQuestions] = useState<SprintQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [userAnswers, setUserAnswers] = useState<
    { question: SprintQuestion; userVal: string; isCorrect: boolean }[]
  >([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate 10 mixed questions
  const generateQuestions = (): SprintQuestion[] => {
    const list: SprintQuestion[] = [];

    // 1-3: Dec to Bin (8-bit)
    for (let i = 0; i < 3; i++) {
      const dec = Math.floor(Math.random() * 255) + 1;
      const bin = Conversions.decToBin(dec, 8);
      list.push({
        id: list.length + 1,
        type: "Dezimal ➔ Binär",
        questionText: `Wandle ${dec} in eine 8-Bit-Binärzahl um:`,
        expectedAnswer: bin,
        explanation: `${dec} = ${bin}₂`,
        category: "dec2bin",
      });
    }

    // 4-6: Bin to Dec
    for (let i = 0; i < 3; i++) {
      const dec = Math.floor(Math.random() * 255) + 1;
      const bin = Conversions.decToBin(dec, 8);
      list.push({
        id: list.length + 1,
        type: "Binär ➔ Dezimal",
        questionText: `Wandle ${Conversions.formatNibbles(bin)}₂ in Dezimal um:`,
        expectedAnswer: String(dec),
        explanation: `${bin}₂ = ${dec}₁₀`,
        category: "bin2dec",
      });
    }

    // 7-8: Subnetting / CIDR
    for (let i = 0; i < 2; i++) {
      const entry = SUBNET_TABLE[Math.floor(Math.random() * SUBNET_TABLE.length)];
      if (i === 0) {
        list.push({
          id: list.length + 1,
          type: "IPv4-Subnetzmaske",
          questionText: `Welcher Wert steht im 4. Oktett bei ${entry.cidr}?`,
          expectedAnswer: String(entry.maskOctet),
          explanation: `${entry.cidr} = 255.255.255.${entry.maskOctet}`,
          category: "subnet",
        });
      } else {
        list.push({
          id: list.length + 1,
          type: "Schrittweite (Magic Number)",
          questionText: `Wie groß ist die Schrittweite bei ${entry.cidr} (256 - .${entry.maskOctet})?`,
          expectedAnswer: String(entry.magicNumber),
          explanation: `Schrittweite = 256 - ${entry.maskOctet} = ${entry.magicNumber}`,
          category: "subnet",
        });
      }
    }

    // 9-10: Hex conversions
    for (let i = 0; i < 2; i++) {
      const val = Math.floor(Math.random() * 255) + 1;
      const hex = Conversions.decToHex(val, 2);
      if (i === 0) {
        list.push({
          id: list.length + 1,
          type: "Dezimal ➔ Hex",
          questionText: `Wandle ${val} in eine 2-stellige Hex-Zahl um:`,
          expectedAnswer: hex,
          explanation: `${val} = 0x${hex}`,
          category: "hex",
        });
      } else {
        list.push({
          id: list.length + 1,
          type: "Hex ➔ Dezimal",
          questionText: `Wandle 0x${hex} in eine Dezimalzahl um:`,
          expectedAnswer: String(val),
          explanation: `0x${hex} = ${val}₁₀`,
          category: "hex",
        });
      }
    }

    // Shuffle questions
    return list.sort(() => Math.random() - 0.5);
  };

  const startSprint = () => {
    onPlayClick();
    const qs = generateQuestions();
    setQuestions(qs);
    setCurrentIndex(0);
    setUserAnswer("");
    setUserAnswers([]);
    setElapsedSeconds(0);
    setGameState("running");
  };

  // Timer interval
  useEffect(() => {
    if (gameState === "running") {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const finishSprint = useCallback(() => {
    setGameState("finished");
    onPlayTrophy();
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Confetti fallback
    }
  }, [onPlayTrophy]);

  const submitAnswer = () => {
    if (!questions[currentIndex]) return;
    const q = questions[currentIndex];
    const cleanedUser = userAnswer.trim().toUpperCase().replace(/^0X/, "").replace(/\s+/g, "");
    const cleanedExpected = q.expectedAnswer.toUpperCase().replace(/^0X/, "").replace(/\s+/g, "");

    let isCorrect = false;
    if (q.category === "dec2bin") {
      isCorrect = cleanedUser.padStart(8, "0") === cleanedExpected.padStart(8, "0");
    } else {
      isCorrect = cleanedUser === cleanedExpected;
    }

    if (isCorrect) {
      onSuccess();
    } else {
      onError();
    }

    const nextAnswers = [
      ...userAnswers,
      { question: q, userVal: userAnswer.trim(), isCorrect },
    ];
    setUserAnswers(nextAnswers);
    setUserAnswer("");

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((idx) => idx + 1);
    } else {
      finishSprint();
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
  };

  const correctCount = userAnswers.filter((a) => a.isCorrect).length;
  const score = Math.max(0, correctCount * 100 - elapsedSeconds * 2);

  return (
    <div className="space-y-6">
      {/* Zustand 1: Startbildschirm */}
      {gameState === "idle" && (
        <div className="p-8 sm:p-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Zap size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            FiSi Prüfungs-Sprint (Speed Challenge)
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto mt-2">
            10 gemischte Aufgaben zur Prüfungsvorbereitung: Dezimal, Binär, IPv4-Subnetzmasken und Hexadezimal.
            Kannst du alle 10 Aufgaben fehlerfrei und auf Zeit lösen?
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto my-6 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[var(--text-muted)] block">Aufgaben</span>
              <strong className="text-base text-sky-400">10</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[var(--text-muted)] block">Fokus</span>
              <strong className="text-base text-indigo-400">FiSi / IHK</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-[var(--text-muted)] block">Modus</span>
              <strong className="text-base text-emerald-400">Stoppuhr</strong>
            </div>
          </div>

          <button
            onClick={startSprint}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-sky-500/25 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            Sprint jetzt starten ⚡
          </button>
        </div>
      )}

      {/* Zustand 2: Laufender Sprint */}
      {gameState === "running" && questions[currentIndex] && (
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-sm">
          {/* Status-Leiste */}
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)] mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Frage {currentIndex + 1} von {questions.length}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {questions[currentIndex].type}
              </span>
            </div>

            <div className="flex items-center gap-2 font-mono text-sm font-bold text-amber-400">
              <Timer size={16} />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-sky-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Frage */}
          <div className="text-center py-4">
            <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              {questions[currentIndex].questionText}
            </h3>

            {/* Eingabe */}
            <div className="max-w-xs mx-auto mt-6">
              <input
                type="text"
                autoFocus
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
                placeholder="Antwort eingeben..."
                className="w-full text-center font-mono text-2xl py-3 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-input)] text-[var(--text-primary)] focus:outline-none focus:border-sky-400 transition-all uppercase"
              />
            </div>

            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={submitAnswer}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-all cursor-pointer shadow-md shadow-sky-500/20 text-base"
              >
                {currentIndex + 1 === questions.length ? (
                  <>
                    <Check size={18} /> Sprint abschließen
                  </>
                ) : (
                  <>
                    <ArrowRight size={18} /> Nächste Frage
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zustand 3: Auswertung am Ende */}
      {gameState === "finished" && (
        <div className="p-8 sm:p-12 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-color)] text-center shadow-sm">
          <div className="w-20 h-20 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <Trophy size={40} />
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            Sprint beendet!
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Hier ist dein offizielles Prüfungsergebnis:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto my-6 font-mono">
            <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-xs text-[var(--text-muted)] block">Richtig</span>
              <strong className="text-2xl text-emerald-400">
                {correctCount} / {questions.length}
              </strong>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-xs text-[var(--text-muted)] block">Gesamtzeit</span>
              <strong className="text-2xl text-amber-400">{formatTime(elapsedSeconds)}</strong>
            </div>
            <div className="p-4 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-color)]">
              <span className="text-xs text-[var(--text-muted)] block">Punkte</span>
              <strong className="text-2xl text-sky-400">{score}</strong>
            </div>
          </div>

          {/* Detaillierte Fehleraufschlüsselung */}
          <div className="text-left max-w-xl mx-auto my-6 space-y-2">
            <h4 className="font-semibold text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2">
              Fragen-Übersicht & Analyse:
            </h4>
            {userAnswers.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-xs font-mono flex items-start justify-between gap-3 ${
                  item.isCorrect
                    ? "bg-emerald-500/5 border-emerald-500/30 text-[var(--text-primary)]"
                    : "bg-rose-500/5 border-rose-500/30 text-[var(--text-primary)]"
                }`}
              >
                <div>
                  <span className="font-bold text-[var(--text-secondary)]">#{idx + 1}: </span>
                  <span>{item.question.questionText}</span>
                  <div className="text-[var(--text-muted)] text-[11px] mt-0.5">
                    Erklärung: {item.question.explanation}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`font-bold ${
                      item.isCorrect ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {item.isCorrect ? "✓ Richtig" : `✗ Deine Eingabe: ${item.userVal || "(leer)"}`}
                  </span>
                  {!item.isCorrect && (
                    <div className="text-[10px] text-sky-400">
                      Richtig: {item.question.expectedAnswer}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              onClick={startSprint}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition-all cursor-pointer mx-auto shadow-md shadow-sky-500/20"
            >
              <RotateCcw size={18} /> Nochmal versuchen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
