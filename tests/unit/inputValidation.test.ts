import { describe, it, expect } from "vitest";
import { validateExactBitPattern } from "@/lib/validation";

describe("Strict 8-Bit Input Validation (Befund 6)", () => {
  it("accepts valid 8-bit patterns with exactly 8 bits", () => {
    expect(validateExactBitPattern("00101100", 8)).toEqual({ ok: true, clean: "00101100" });
    expect(validateExactBitPattern("00000000", 8)).toEqual({ ok: true, clean: "00000000" });
    expect(validateExactBitPattern("11111111", 8)).toEqual({ ok: true, clean: "11111111" });
  });

  it("accepts 8-bit patterns with formatted spaces between nibbles", () => {
    expect(validateExactBitPattern("0010 1100", 8)).toEqual({ ok: true, clean: "00101100" });
  });

  it("REPRODUCE Befund 6: rejects shorter bit patterns without padStart auto-fill", () => {
    // Live bug: target 44 accepted "101100" because of padStart(8, "0")
    const shortResult = validateExactBitPattern("101100", 8);
    expect(shortResult.ok).toBe(false);
    if (!shortResult.ok) {
      expect(shortResult.error).toMatch(/exakt 8 Bit/i);
    }
  });

  it("REPRODUCE Befund 6: rejects 3-bit pattern 101 for hex 0x05", () => {
    const shortHex2Bin = validateExactBitPattern("101", 8);
    expect(shortHex2Bin.ok).toBe(false);
    if (!shortHex2Bin.ok) {
      expect(shortHex2Bin.error).toMatch(/exakt 8 Bit/i);
    }
  });

  it("rejects patterns longer than 8 bits", () => {
    const longResult = validateExactBitPattern("000101100", 8);
    expect(longResult.ok).toBe(false);
  });

  it("rejects non-binary characters", () => {
    expect(validateExactBitPattern("0010110a", 8).ok).toBe(false);
    expect(validateExactBitPattern("10201010", 8).ok).toBe(false);
  });
});
