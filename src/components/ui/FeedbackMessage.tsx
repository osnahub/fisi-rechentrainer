"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import { ExerciseFeedback } from "@/hooks/useExerciseState";

interface FeedbackMessageProps {
  feedback: ExerciseFeedback | null;
  className?: string;
}

export function FeedbackMessage({ feedback, className = "" }: FeedbackMessageProps) {
  if (!feedback) return null;

  const isCorrect = feedback.isCorrect;

  return (
    <div
      role={isCorrect ? "status" : "alert"}
      aria-live={isCorrect ? "polite" : "assertive"}
      className={`mt-4 sm:mt-5 p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm font-medium border flex flex-col items-center justify-center gap-1.5 animate-pop-in ${
        isCorrect
          ? "bg-[var(--success-bg)] border-[var(--success-border)] text-[var(--success-text)]"
          : "bg-[var(--error-bg)] border-[var(--error-border)] text-[var(--error-text)]"
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        {isCorrect ? (
          <CheckCircle2 size={18} className="shrink-0 text-emerald-700 dark:text-emerald-400" />
        ) : (
          <AlertCircle size={18} className="shrink-0 text-rose-700 dark:text-rose-400" />
        )}
        <span className="font-semibold">{feedback.message}</span>
      </div>

      {feedback.hint && !isCorrect && (
        <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-normal">
          <Lightbulb size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{feedback.hint}</span>
        </div>
      )}
    </div>
  );
}
