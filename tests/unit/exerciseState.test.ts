import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useExerciseState } from "@/hooks/useExerciseState";

describe("useExerciseState - Streak and State Machine Logic", () => {
  it("REPRODUCE BUG: checking the same correct answer multiple times must only increase streak ONCE", () => {
    let streak = 0;
    const onStreakUpdate = (isCorrect: boolean) => {
      streak = isCorrect ? streak + 1 : 0;
    };

    const { result } = renderHook(() =>
      useExerciseState({
        generator: () => 42,
        validator: (input, target) => parseInt(input, 10) === target,
        onStreakUpdate,
      })
    );

    // Initial state
    expect(result.current.status).toBe("unanswered");
    expect(result.current.streakAwarded).toBe(false);
    expect(streak).toBe(0);

    // Submit correct answer first time
    act(() => {
      result.current.setUserInput("42");
    });
    act(() => {
      result.current.checkAnswer();
    });

    expect(result.current.status).toBe("correct");
    expect(result.current.streakAwarded).toBe(true);
    expect(streak).toBe(1);

    // Submit correct answer second time (bug would make streak = 2)
    act(() => {
      result.current.checkAnswer();
    });
    expect(streak).toBe(1); // Streak must remain 1!

    // Submit correct answer third time
    act(() => {
      result.current.checkAnswer();
    });
    expect(streak).toBe(1); // Streak must remain 1!
  });

  it("revealing the solution forfeits streak points for this task", () => {
    let streak = 5;
    const onStreakUpdate = (isCorrect: boolean) => {
      streak = isCorrect ? streak + 1 : 0;
    };

    const { result } = renderHook(() =>
      useExerciseState({
        generator: () => 100,
        validator: (input, target) => parseInt(input, 10) === target,
        onStreakUpdate,
      })
    );

    act(() => {
      result.current.revealSolution();
    });

    expect(result.current.status).toBe("revealed");
    expect(result.current.solutionRevealed).toBe(true);

    // Even if user now submits correct answer, no streak point is awarded
    act(() => {
      result.current.setUserInput("100");
    });
    act(() => {
      result.current.checkAnswer();
    });

    expect(streak).toBe(5); // streak not increased
    expect(result.current.streakAwarded).toBe(false);
  });

  it("incorrect answer resets streak on first failure", () => {
    let streak = 3;
    const onStreakUpdate = (isCorrect: boolean) => {
      streak = isCorrect ? streak + 1 : 0;
    };

    const { result } = renderHook(() =>
      useExerciseState({
        generator: () => 100,
        validator: (input, target) => parseInt(input, 10) === target,
        onStreakUpdate,
      })
    );

    act(() => {
      result.current.setUserInput("99");
    });
    act(() => {
      result.current.checkAnswer();
    });

    expect(result.current.status).toBe("incorrect");
    expect(result.current.attemptCount).toBe(1);
    expect(streak).toBe(0);
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
        validator: (input, target) => parseInt(input, 10) === target,
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
