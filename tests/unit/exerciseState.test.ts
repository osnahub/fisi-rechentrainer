import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useExerciseState } from "@/hooks/useExerciseState";

describe("useExerciseState - State Machine Logic", () => {
  it("initializes in unanswered state and transitions to correct upon valid answer", () => {
    const { result } = renderHook(() =>
      useExerciseState({
        generator: () => 42,
        validator: (input, target) => parseInt(input, 10) === target,
        getSuccessMessage: (target) => `Success ${target}`,
      })
    );

    // Initial state
    expect(result.current.status).toBe("unanswered");
    expect(result.current.attemptCount).toBe(0);
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.solutionRevealed).toBe(false);

    // Submit correct answer
    act(() => {
      result.current.setUserInput("42");
    });
    act(() => {
      const ok = result.current.checkAnswer();
      expect(ok).toBe(true);
    });

    expect(result.current.status).toBe("correct");
    expect(result.current.isCompleted).toBe(true);
    expect(result.current.feedback?.isCorrect).toBe(true);
    expect(result.current.feedback?.message).toBe("Success 42");

    // Repeated checkAnswer when already correct should stay correct
    act(() => {
      const ok = result.current.checkAnswer();
      expect(ok).toBe(true);
    });
    expect(result.current.status).toBe("correct");
  });

  it("handles incorrect answer, increments attempts, and provides hint", () => {
    const { result } = renderHook(() =>
      useExerciseState({
        generator: () => 100,
        validator: (input, target) => parseInt(input, 10) === target,
        getHint: (_input, target, attempts) => attempts === 1 ? `Hint for ${target}` : null,
      })
    );

    act(() => {
      result.current.setUserInput("99");
    });
    act(() => {
      const ok = result.current.checkAnswer();
      expect(ok).toBe(false);
    });

    expect(result.current.status).toBe("incorrect");
    expect(result.current.attemptCount).toBe(1);
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.feedback?.isCorrect).toBe(false);
    expect(result.current.feedback?.hint).toBe("Hint for 100");
  });

  it("revealSolution sets status to revealed and completes exercise", () => {
    const { result } = renderHook(() =>
      useExerciseState({
        generator: () => 100,
        validator: (input, target) => parseInt(input, 10) === target,
      })
    );

    act(() => {
      result.current.revealSolution();
    });

    expect(result.current.status).toBe("revealed");
    expect(result.current.solutionRevealed).toBe(true);
    expect(result.current.isCompleted).toBe(true);
    expect(result.current.feedback).toBeNull();
  });

  it("clears previously set error feedback upon revealSolution", () => {
    const { result } = renderHook(() =>
      useExerciseState({
        generator: () => 100,
        validator: (input, target) => parseInt(input, 10) === target,
      })
    );

    act(() => {
      result.current.setUserInput("50");
    });
    act(() => {
      result.current.checkAnswer();
    });
    expect(result.current.status).toBe("incorrect");
    expect(result.current.feedback?.isCorrect).toBe(false);

    act(() => {
      result.current.revealSolution();
    });
    expect(result.current.status).toBe("revealed");
    // Old error feedback must not dominate the solution
    expect(result.current.feedback).toBeNull();
  });

  it("nextTask resets state and produces new target", () => {
    let nextVal = 10;
    const { result } = renderHook(() =>
      useExerciseState({
        generator: () => nextVal++,
        validator: (input, target) => parseInt(input, 10) === target,
      })
    );

    expect(result.current.target).toBe(10);

    act(() => {
      result.current.setUserInput("10");
    });
    act(() => {
      result.current.checkAnswer();
    });
    expect(result.current.status).toBe("correct");

    act(() => {
      result.current.nextTask();
    });

    expect(result.current.status).toBe("unanswered");
    expect(result.current.attemptCount).toBe(0);
    expect(result.current.solutionRevealed).toBe(false);
    expect(result.current.userInput).toBe("");
    expect(result.current.feedback).toBe(null);
    expect(result.current.target).toBe(11);
  });

  it("supports injectable RNG and includes 0 without immediate repetition", () => {
    // Sequence returning 0 (0.1), then 0 (0.2) which repeats prev, then 1 (0.8)
    const sequence = [0.1, 0.2, 0.8];
    let idx = 0;
    const mockRng = () => sequence[idx++];

    const { result } = renderHook(() =>
      useExerciseState({
        generator: (prev, rng) => {
          let val = Math.floor((rng ? rng() : Math.random()) * 2);
          while (val === prev) {
            val = Math.floor((rng ? rng() : Math.random()) * 2);
          }
          return val;
        },
        validator: () => true,
        rng: mockRng,
      })
    );

    expect(result.current.target).toBe(0);

    act(() => {
      result.current.nextTask();
    });

    expect(result.current.target).toBe(1);
  });
});
