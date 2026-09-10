"use client";

import React from "react";
import { Check, RefreshCw, Eye, ArrowRight } from "lucide-react";

interface ExerciseActionsProps {
  isCompleted: boolean;
  onCheck: () => void;
  onNext: () => void;
  onRevealSolution: () => void;
  showSolutionText?: string;
}

export function ExerciseActions({
  isCompleted,
  onCheck,
  onNext,
  onRevealSolution,
  showSolutionText = "Lösungsweg",
}: ExerciseActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 mt-5">
      {isCompleted ? (
        <button
          type="button"
          onClick={onNext}
          className="min-h-[42px] flex items-center justify-center gap-1.5 sm:gap-2 px-6 sm:px-7 py-2 sm:py-2.5 rounded-xl bg-[var(--primary-btn-bg)] hover:bg-[var(--primary-btn-hover)] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
        >
          <ArrowRight size={16} />
          <span>Nächste Aufgabe (Enter ↵)</span>
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={onCheck}
            className="min-h-[42px] flex items-center justify-center gap-1.5 sm:gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-[var(--primary-btn-bg)] hover:bg-[var(--primary-btn-hover)] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            <Check size={16} />
            <span>Ergebnis prüfen</span>
          </button>

          <button
            type="button"
            onClick={onNext}
            className="min-h-[42px] flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            <RefreshCw size={14} />
            <span>Überspringen</span>
          </button>

          <button
            type="button"
            onClick={onRevealSolution}
            className="min-h-[42px] flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-sky-700 dark:hover:text-sky-400 hover:border-sky-500/40 transition-all cursor-pointer text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            <Eye size={14} />
            <span>{showSolutionText}</span>
          </button>
        </>
      )}
    </div>
  );
}
