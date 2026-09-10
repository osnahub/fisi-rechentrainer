import { describe, it, expect } from "vitest";
import { Conversions } from "@/lib/conversions";

describe("Conversions - Bug Reproductions (P0/P1)", () => {
  it("REPRODUCE P0: decToBin(4294967296, 32) must NOT return 32 zeros (silent wrap)", () => {
    // Current bug: (4294967296 >>> 0) wraps to 0, outputting 32 zeros
    // Desired: Range 0..4294967295 (unsigned 32-bit). Values >= 2^32 must throw RangeError
    expect(() => Conversions.decToBin(4294967296, 32)).toThrow(RangeError);
  });

  it("REPRODUCE P0: 33-bit input 100000000000000000000000000000000 must be rejected", () => {
    // 33 bits represents 2^32, exceeding unsigned 32-bit range
    expect(Conversions.parseBinaryInput("100000000000000000000000000000000").ok).toBe(false);
  });

  it("REPRODUCE P1: hexToBin('GG') must be rejected and not return 00000000", () => {
    expect(Conversions.parseHexInput("GG").ok).toBe(false);
  });

  it("REPRODUCE P1: getDivisionSteps(1.5) must reject non-integers", () => {
    expect(() => Conversions.getDivisionSteps(1.5)).toThrow(RangeError);
  });

  it("REPRODUCE Befund 7: decToBin(256, 8) must throw RangeError if value exceeds bitCount capacity", () => {
    // 256 requires 9 bits (100000000). If bitCount is 8, it must throw RangeError.
    expect(() => Conversions.decToBin(256, 8)).toThrow(RangeError);
  });

  it("REPRODUCE Befund 7: getPolynomialExpansion('10x') must reject invalid binary characters", () => {
    // Currently 'x' is silently treated as 0 instead of rejecting
    expect(() => Conversions.getPolynomialExpansion("10x")).toThrow();
  });

  it("REPRODUCE Befund 7: getStellenwertSteps(5, 0) must reject bitCount < 1 or > 32", () => {
    expect(() => Conversions.getStellenwertSteps(5, 0)).toThrow(RangeError);
    expect(() => Conversions.getStellenwertSteps(5, 33)).toThrow(RangeError);
  });

  it("REPRODUCE Befund 7: getSubnetExample must reject NaN, non-integers, and CIDR outside 24..32", () => {
    expect(() => Conversions.getSubnetExample(NaN)).toThrow();
    expect(() => Conversions.getSubnetExample(23)).toThrow(RangeError);
    expect(() => Conversions.getSubnetExample(33)).toThrow(RangeError);
    expect(() => Conversions.getSubnetExample(24.5)).toThrow();
  });

  it("REPRODUCE Befund 7: parseHexInput('  0x1A') must handle leading whitespace before 0x", () => {
    const res = Conversions.parseHexInput("  0x1A");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.value.clean).toBe("1A");
      expect(res.value.value).toBe(26);
    }
  });

  it("REPRODUCE Befund 7: Conversions methods must not crash when destructured without 'this'", () => {
    const { binToDec, hexToDec, hexToBin, binToHex } = Conversions;
    expect(binToDec("1010")).toBe(10);
    expect(hexToDec("1A")).toBe(26);
    expect(hexToBin("A")).toBe("1010");
    expect(binToHex("1010")).toBe("A");
  });
});

describe("Conversions - Boundaries and Validation", () => {
  it("parses valid boundary decimal values up to 4294967295", () => {
    const validValues = [0, 1, 255, 256, 65535, 65536, 4294967295];
    for (const val of validValues) {
      const res = Conversions.parseDecimalInput(String(val));
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value).toBe(val);
      }
    }
  });

  it("rejects decimal values >= 4294967296, negative numbers, fractions, NaN, and text", () => {
    const invalidInputs = [
      "4294967296",
      "5000000000",
      "-1",
      "-255",
      "1.5",
      "0.1",
      "NaN",
      "Infinity",
      "-Infinity",
      "abc",
      "12a",
      "",
      " ",
    ];
    for (const input of invalidInputs) {
      const res = Conversions.parseDecimalInput(input);
      expect(res.ok, `Expected rejection for input: '${input}'`).toBe(false);
    }
  });

  it("parses valid binary strings between 1 and 32 bits", () => {
    expect(Conversions.parseBinaryInput("0").ok).toBe(true);
    expect(Conversions.parseBinaryInput("1").ok).toBe(true);
    expect(Conversions.parseBinaryInput("11111111").ok).toBe(true);
    expect(Conversions.parseBinaryInput("1".repeat(32)).ok).toBe(true);
  });

  it("rejects invalid binary strings (33 bits, negative, invalid chars, empty)", () => {
    expect(Conversions.parseBinaryInput("1".repeat(33)).ok).toBe(false);
    expect(Conversions.parseBinaryInput("102").ok).toBe(false);
    expect(Conversions.parseBinaryInput("-1").ok).toBe(false);
    expect(Conversions.parseBinaryInput("").ok).toBe(false);
    expect(Conversions.parseBinaryInput("   ").ok).toBe(false);
  });

  it("parses valid hex strings up to 8 hex digits (32 bits)", () => {
    expect(Conversions.parseHexInput("0").ok).toBe(true);
    expect(Conversions.parseHexInput("FF").ok).toBe(true);
    expect(Conversions.parseHexInput("0xFF").ok).toBe(true);
    expect(Conversions.parseHexInput("FFFFFFFF").ok).toBe(true);
  });

  it("rejects invalid hex strings (>8 digits, invalid characters)", () => {
    expect(Conversions.parseHexInput("100000000").ok).toBe(false); // 9 digits = 2^32
    expect(Conversions.parseHexInput("GG").ok).toBe(false);
    expect(Conversions.parseHexInput("-1").ok).toBe(false);
    expect(Conversions.parseHexInput("").ok).toBe(false);
  });
});

describe("Conversions - Exhaustive 0..255 Round-Trips", () => {
  it("verifies decToBin / binToDec round-trip for all 256 values", () => {
    for (let n = 0; n <= 255; n++) {
      const bin = Conversions.decToBin(n, 8);
      expect(bin).toHaveLength(8);
      expect(Conversions.binToDec(bin)).toBe(n);
    }
  });

  it("verifies decToHex / hexToDec round-trip for all 256 values", () => {
    for (let n = 0; n <= 255; n++) {
      const hex = Conversions.decToHex(n, 2);
      expect(hex).toHaveLength(2);
      expect(Conversions.hexToDec(hex)).toBe(n);
    }
  });

  it("verifies binToHex / hexToBin round-trip for all 256 values", () => {
    for (let n = 0; n <= 255; n++) {
      const bin = Conversions.decToBin(n, 8);
      const hex = Conversions.binToHex(bin);
      const backBin = Conversions.hexToBin(hex);
      expect(backBin).toBe(bin);
    }
  });

  it("verifies Stellenwertsumme matches n for all 256 values", () => {
    for (let n = 0; n <= 255; n++) {
      const steps = Conversions.getStellenwertSteps(n, 8);
      const sum = steps
        .filter((s) => s.bit === 1)
        .reduce((acc, s) => acc + s.val, 0);
      expect(sum).toBe(n);
    }
  });

  it("verifies getDivisionSteps remainder reconstruction matches n for all 256 values", () => {
    for (let n = 0; n <= 255; n++) {
      const steps = Conversions.getDivisionSteps(n);
      const reconstructedBin = steps
        .slice()
        .reverse()
        .map((s) => s.remainder)
        .join("");
      expect(parseInt(reconstructedBin, 2)).toBe(n);
    }
  });
});
