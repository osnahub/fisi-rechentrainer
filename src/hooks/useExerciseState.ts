"use client";

import { useState, useCallback, useSyncExternalStore } from "react";

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
  rng?: () => number;
  initialTarget?: T;
}

const emptySubscribe = () => () => {};

export function useExerciseState<T>({
  generator,
  validator,
  getSuccessMessage,
  getErrorMessage,
  getHint,
  rng,
  initialTarget,
}: UseExerciseStateOptions<T>) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [target, setTarget] = useState<T>(() => {
    if (initialTarget !== undefined) return initialTarget;
    return generator(undefined, rng);
  });

  const [status, setStatus] = useState<ExerciseStatus>("unanswered");
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [solutionRevealed, setSolutionRevealed] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>("");
  const [feedback, setFeedback] = useState<ExerciseFeedback | null>(null);

  const nextTask = useCallback(() => {
    const next = generator(target, rng);
    setTarget(next);
    setStatus("unanswered");
    setAttemptCount(0);
    setSolutionRevealed(false);
    setUserInput("");
    setFeedback(null);
  }, [generator, rng, target]);

  const checkAnswer = useCallback(() => {
    // If already correct, do nothing
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
      return true;
    } else {
      const newAttempts = attemptCount + 1;
      setAttemptCount(newAttempts);
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
    attemptCount,
    getHint,
    getErrorMessage,
  ]);

  const revealSolution = useCallback(() => {
    setSolutionRevealed(true);
    setStatus("revealed");
    // Clear old error feedback so it doesn't dominate the revealed solution
    setFeedback(null);
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
    target: target as T,
    isMounted,
    status,
    attemptCount,
    solutionRevealed,
    userInput,
    setUserInput,
    feedback,
    checkAnswer,
    revealSolution,
    nextTask,
    handleKeyDown,
    isCompleted: status === "correct" || status === "revealed",
  };
}
