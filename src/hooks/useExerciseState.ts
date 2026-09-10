"use client";

import { useState, useCallback } from "react";

export type ExerciseStatus = "unanswered" | "incorrect" | "correct" | "revealed";

export interface ExerciseFeedback {
  isCorrect: boolean;
  message: string;
  hint?: string | null;
}

export interface UseExerciseStateOptions<T> {
  generator: (prevTarget?: T, rng?: () => number) => T;
  validator: (userInput: string, target: T) => boolean;
  getSuccessMessage?: (target: T, userInput: string) => string;
  getErrorMessage?: (target: T, userInput: string, attemptCount: number) => string;
  getHint?: (userInput: string, target: T, attemptCount: number) => string | null;
  onStreakUpdate?: (isCorrect: boolean) => void;
  rng?: () => number;
}

export function useExerciseState<T>({
  generator,
  validator,
  getSuccessMessage,
  getErrorMessage,
  getHint,
  onStreakUpdate,
  rng,
}: UseExerciseStateOptions<T>) {
  // Use lazy initialization so that generator is called once synchronously on initial mount
  const [taskCount, setTaskCount] = useState<number>(1);
  const [target, setTarget] = useState<T>(() => generator(undefined, rng));
  const [status, setStatus] = useState<ExerciseStatus>("unanswered");
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [solutionRevealed, setSolutionRevealed] = useState<boolean>(false);
  const [streakAwarded, setStreakAwarded] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [feedback, setFeedback] = useState<ExerciseFeedback | null>(null);

  const taskId = `task-${taskCount}`;

  const nextTask = useCallback(() => {
    setTarget((prevTarget) => generator(prevTarget, rng));
    setTaskCount((prev) => prev + 1);
    setStatus("unanswered");
    setAttemptCount(0);
    setSolutionRevealed(false);
    setStreakAwarded(false);
    setUserInput("");
    setFeedback(null);
  }, [generator, rng]);

  const checkAnswer = useCallback(() => {
    // If already correct, do nothing to prevent multi-increment
    if (status === "correct") {
      return true;
    }

    const isCorrect = validator(userInput, target);

    if (isCorrect) {
      setStatus("correct");
      const msg = getSuccessMessage
        ? getSuccessMessage(target, userInput)
        : "Hervorragend! Die Antwort ist richtig.";
      setFeedback({ isCorrect: true, message: msg });

      // Streak point is ONLY awarded if the solution was not revealed and not already awarded
      if (!solutionRevealed && !streakAwarded) {
        setStreakAwarded(true);
        onStreakUpdate?.(true);
      }
      return true;
    } else {
      const newAttempts = attemptCount + 1;
      setAttemptCount(newAttempts);

      // Streak is reset on first incorrect answer (if not revealed)
      if (status !== "incorrect" && !solutionRevealed) {
        onStreakUpdate?.(false);
      }
      setStatus("incorrect");

      const hint = getHint ? getHint(userInput, target, newAttempts) : null;
      const msg = getErrorMessage
        ? getErrorMessage(target, userInput, newAttempts)
        : "Leider nicht richtig. Versuche es noch einmal!";

      setFeedback({
        isCorrect: false,
        message: msg,
        hint,
      });
      return false;
    }
  }, [
    status,
    userInput,
    target,
    validator,
    getSuccessMessage,
    solutionRevealed,
    streakAwarded,
    onStreakUpdate,
    attemptCount,
    getHint,
    getErrorMessage,
  ]);

  const revealSolution = useCallback(() => {
    setSolutionRevealed(true);
    setStatus("revealed");
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (status === "correct" || status === "revealed") {
          nextTask();
        } else {
          checkAnswer();
        }
      }
    },
    [status, nextTask, checkAnswer]
  );

  return {
    taskId,
    target,
    status,
    attemptCount,
    solutionRevealed,
    streakAwarded,
    userInput,
    setUserInput,
    feedback,
    setFeedback,
    checkAnswer,
    revealSolution,
    nextTask,
    handleKeyDown,
    isCompleted: status === "correct" || status === "revealed",
  };
}
