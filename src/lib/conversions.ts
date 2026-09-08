export interface StellenwertStep {
  power: number;
  val: number;
  fits: boolean;
  bit: number;
  prevRemainder: number;
  newRemainder: number;
}

export interface DivisionStep {
  original: number;
  divResult: number;
  remainder: number;
}

export interface HexDivisionStep {
  original: number;
  divResult: number;
  remainder: number;
  hexChar: string;
}

const HEX_CHARS = "0123456789ABCDEF";

export const Conversions = {
  decToBin(dec: number, bitCount = 8): string {
    if (isNaN(dec) || dec < 0) return "0".repeat(bitCount);
    const raw = (dec >>> 0).toString(2);
    return raw.padStart(bitCount, "0");
  },

  binToDec(binStr: string): number {
    const clean = binStr.replace(/\s+/g, "");
    if (!/^[01]+$/.test(clean)) return 0;
    return parseInt(clean, 2);
  },

  decToHex(dec: number, pad = 2): string {
    if (isNaN(dec) || dec < 0) return "0".padStart(pad, "0");
    return dec.toString(16).toUpperCase().padStart(pad, "0");
  },

  hexToDec(hexStr: string): number {
    const clean = hexStr.replace(/^0x/i, "").trim();
    if (!/^[0-9A-Fa-f]+$/.test(clean)) return 0;
    return parseInt(clean, 16);
  },

  hexToBin(hexStr: string): string {
    const clean = hexStr.replace(/^0x/i, "").trim().toUpperCase();
    return clean
      .split("")
      .map((c) => {
        const val = parseInt(c, 16);
        return isNaN(val) ? "0000" : val.toString(2).padStart(4, "0");
      })
      .join("");
  },

  binToHex(binStr: string): string {
    const clean = binStr.replace(/\s+/g, "");
    if (!/^[01]+$/.test(clean)) return "00";
    const padLen = Math.ceil(clean.length / 4) * 4;
    const padded = clean.padStart(padLen, "0");
    let hex = "";
    for (let i = 0; i < padded.length; i += 4) {
      const chunk = padded.substring(i, i + 4);
      hex += parseInt(chunk, 2).toString(16).toUpperCase();
    }
    return hex;
  },

  formatNibbles(binStr: string): string {
    const clean = binStr.replace(/\s+/g, "");
    const parts: string[] = [];
    for (let i = clean.length; i > 0; i -= 4) {
      const start = Math.max(0, i - 4);
      parts.unshift(clean.substring(start, i));
    }
    return parts.join(" ");
  },

  getStellenwertSteps(decimalNumber: number, bitCount = 8): StellenwertStep[] {
    const steps: StellenwertStep[] = [];
    let remainder = decimalNumber;

    let power = bitCount - 1;
    while (Math.pow(2, power) <= decimalNumber && power < 31) {
      power++;
    }
    const maxPower = Math.max(bitCount - 1, power);

    for (let p = maxPower; p >= 0; p--) {
      const val = Math.pow(2, p);
      const fits = remainder >= val;
      const bit = fits ? 1 : 0;
      const prevRemainder = remainder;
      if (fits) {
        remainder -= val;
      }
      steps.push({
        power: p,
        val,
        fits,
        bit,
        prevRemainder,
        newRemainder: remainder,
      });
    }
    return steps;
  },

  getDivisionSteps(decimalNumber: number): DivisionStep[] {
    if (decimalNumber === 0) {
      return [{ original: 0, divResult: 0, remainder: 0 }];
    }
    const steps: DivisionStep[] = [];
    let current = decimalNumber;
    while (current > 0) {
      const divResult = Math.floor(current / 2);
      const rem = current % 2;
      steps.push({
        original: current,
        divResult,
        remainder: rem,
      });
      current = divResult;
    }
    return steps;
  },

  getHexDivisionSteps(decimalNumber: number): HexDivisionStep[] {
    if (decimalNumber === 0) {
      return [{ original: 0, divResult: 0, remainder: 0, hexChar: "0" }];
    }
    const steps: HexDivisionStep[] = [];
    let current = decimalNumber;
    while (current > 0) {
      const divResult = Math.floor(current / 16);
      const rem = current % 16;
      steps.push({
        original: current,
        divResult,
        remainder: rem,
        hexChar: HEX_CHARS[rem] || "0",
      });
      current = divResult;
    }
    return steps;
  },
};
