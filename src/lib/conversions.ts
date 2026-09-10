export interface StellenwertStep {
  power: number;
  val: number;
  fits: boolean;
  bit: number;
  prevRemainder: number;
  newRemainder: number;
}

export interface DivisionStep {
  stepIndex: number;
  original: number;
  divResult: number;
  remainder: number;
  isLSB: boolean;
  isMSB: boolean;
}

export interface HexDivisionStep {
  original: number;
  divResult: number;
  remainder: number;
  hexChar: string;
}

export interface PolynomialTerm {
  power: number;
  bit: number;
  val: number;
  product: number;
  isActive: boolean;
}

export interface SubnetExampleProfile {
  networkAddress: string;
  firstHost: string;
  lastHost: string;
  broadcastAddress: string;
  totalAddresses: number;
  usableHosts: number;
  hostBits: number;
}

export type ParseResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export const MAX_UINT32 = 4294967295;
export const MIN_UINT32 = 0;

const HEX_CHARS = "0123456789ABCDEF";

export const Conversions = {
  /**
   * Parses and validates a decimal string representation.
   * Only non-negative integers between 0 and 4294967295 (unsigned 32-bit) are allowed.
   */
  parseDecimalInput(input: string): ParseResult<number> {
    const trimmed = input.trim();
    if (!trimmed) {
      return { ok: false, error: "Eingabe darf nicht leer sein." };
    }
    if (!/^\d+$/.test(trimmed)) {
      return { ok: false, error: "Ungültige Dezimalzahl. Nur Ziffern (0–9) erlaubt." };
    }

    try {
      const big = BigInt(trimmed);
      if (big < BigInt(0) || big > BigInt(MAX_UINT32)) {
        return {
          ok: false,
          error: `Zahl außerhalb des 32-Bit-Bereichs (0 bis ${MAX_UINT32}).`,
        };
      }
      return { ok: true, value: Number(big) };
    } catch {
      return { ok: false, error: "Ungültiges Zahlenformat." };
    }
  },

  /**
   * Parses and validates a binary string input (1 to 32 bits).
   */
  parseBinaryInput(input: string): ParseResult<{ clean: string; value: number }> {
    const clean = input.replace(/\s+/g, "");
    if (!clean) {
      return { ok: false, error: "Eingabe darf nicht leer sein." };
    }
    if (!/^[01]+$/.test(clean)) {
      return { ok: false, error: "Ungültiges Binärmuster. Nur '0' und '1' erlaubt." };
    }
    if (clean.length > 32) {
      return {
        ok: false,
        error: `Maximal 32 Bit unterstützt (Eingabe hat ${clean.length} Stellen).`,
      };
    }

    const value = parseInt(clean, 2);
    return { ok: true, value: { clean, value } };
  },

  /**
   * Parses and validates a hexadecimal string input (1 to 8 hex digits, 32-bit max).
   */
  parseHexInput(input: string): ParseResult<{ clean: string; value: number }> {
    const clean = input.replace(/^0x/i, "").trim().toUpperCase();
    if (!clean) {
      return { ok: false, error: "Eingabe darf nicht leer sein." };
    }
    if (!/^[0-9A-F]+$/.test(clean)) {
      return { ok: false, error: "Ungültige Hexadezimal-Zahl. Nur 0–9 und A–F erlaubt." };
    }
    if (clean.length > 8) {
      return {
        ok: false,
        error: `Maximal 8 Hex-Stellen (32 Bit) unterstützt (Eingabe hat ${clean.length} Zeichen).`,
      };
    }

    const value = parseInt(clean, 16);
    return { ok: true, value: { clean, value } };
  },

  /**
   * Converts a decimal number to binary with exact padding and range verification.
   * Throws RangeError for values exceeding 32-bit unsigned range (0..4294967295)
   * instead of silent bitwise wrap.
   */
  decToBin(dec: number, bitCount = 8): string {
    if (!Number.isInteger(dec) || dec < MIN_UINT32 || dec > MAX_UINT32) {
      throw new RangeError(
        `decToBin: Wert ${dec} liegt außerhalb des gültigen 32-Bit-Bereichs (0..${MAX_UINT32}).`
      );
    }
    if (bitCount < 1 || bitCount > 32) {
      throw new RangeError(`decToBin: bitCount muss zwischen 1 und 32 liegen.`);
    }

    const raw = dec.toString(2);
    return raw.padStart(bitCount, "0");
  },

  /**
   * Converts a valid binary string to a decimal number.
   * Throws if binary string is invalid or exceeds 32 bits.
   */
  binToDec(binStr: string): number {
    const parsed = this.parseBinaryInput(binStr);
    if (!parsed.ok) {
      throw new Error(parsed.error);
    }
    return parsed.value.value;
  },

  /**
   * Converts a decimal number to hexadecimal with padding.
   */
  decToHex(dec: number, pad = 2): string {
    if (!Number.isInteger(dec) || dec < MIN_UINT32 || dec > MAX_UINT32) {
      throw new RangeError(
        `decToHex: Wert ${dec} liegt außerhalb des gültigen 32-Bit-Bereichs (0..${MAX_UINT32}).`
      );
    }
    return dec.toString(16).toUpperCase().padStart(pad, "0");
  },

  /**
   * Converts a hexadecimal string to a decimal number.
   */
  hexToDec(hexStr: string): number {
    const parsed = this.parseHexInput(hexStr);
    if (!parsed.ok) {
      throw new Error(parsed.error);
    }
    return parsed.value.value;
  },

  /**
   * Converts a hexadecimal string to binary (each hex digit -> 4 bits).
   */
  hexToBin(hexStr: string): string {
    const parsed = this.parseHexInput(hexStr);
    if (!parsed.ok) {
      throw new Error(parsed.error);
    }
    return parsed.value.clean
      .split("")
      .map((c) => parseInt(c, 16).toString(2).padStart(4, "0"))
      .join("");
  },

  /**
   * Converts a binary string to hexadecimal representation.
   */
  binToHex(binStr: string): string {
    const parsed = this.parseBinaryInput(binStr);
    if (!parsed.ok) {
      throw new Error(parsed.error);
    }
    const clean = parsed.value.clean;
    const padLen = Math.ceil(clean.length / 4) * 4;
    const padded = clean.padStart(padLen, "0");
    let hex = "";
    for (let i = 0; i < padded.length; i += 4) {
      const chunk = padded.substring(i, i + 4);
      hex += parseInt(chunk, 2).toString(16).toUpperCase();
    }
    return hex || "0";
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

  getPolynomialExpansion(binStr: string): PolynomialTerm[] {
    const clean = binStr.replace(/\s+/g, "");
    const terms: PolynomialTerm[] = [];
    const len = clean.length;

    for (let i = 0; i < len; i++) {
      const bit = clean[i] === "1" ? 1 : 0;
      const power = len - 1 - i;
      const val = Math.pow(2, power);
      terms.push({
        power,
        bit,
        val,
        product: bit * val,
        isActive: bit === 1,
      });
    }
    return terms;
  },

  getStellenwertSteps(decimalNumber: number, bitCount = 8): StellenwertStep[] {
    if (!Number.isInteger(decimalNumber) || decimalNumber < MIN_UINT32 || decimalNumber > MAX_UINT32) {
      throw new RangeError(
        `getStellenwertSteps: Wert muss eine ganzzahlige 32-Bit-Zahl (0..${MAX_UINT32}) sein.`
      );
    }

    const steps: StellenwertStep[] = [];
    let remainder = decimalNumber;

    const neededPower = remainder > 0 ? Math.floor(Math.log2(remainder)) : 0;
    const maxPower = Math.max(bitCount - 1, neededPower);

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
    if (!Number.isInteger(decimalNumber) || decimalNumber < MIN_UINT32 || decimalNumber > MAX_UINT32) {
      throw new RangeError(
        `getDivisionSteps: Wert muss eine ganzzahlige 32-Bit-Zahl (0..${MAX_UINT32}) sein.`
      );
    }

    if (decimalNumber === 0) {
      return [{ stepIndex: 1, original: 0, divResult: 0, remainder: 0, isLSB: true, isMSB: true }];
    }
    const steps: DivisionStep[] = [];
    let current = decimalNumber;
    let index = 1;

    while (current > 0) {
      const divResult = Math.floor(current / 2);
      const rem = current % 2;
      steps.push({
        stepIndex: index,
        original: current,
        divResult,
        remainder: rem,
        isLSB: index === 1,
        isMSB: false,
      });
      current = divResult;
      index++;
    }

    if (steps.length > 0) {
      steps[steps.length - 1].isMSB = true;
    }

    return steps;
  },

  getHexDivisionSteps(decimalNumber: number): HexDivisionStep[] {
    if (!Number.isInteger(decimalNumber) || decimalNumber < MIN_UINT32 || decimalNumber > MAX_UINT32) {
      throw new RangeError(
        `getHexDivisionSteps: Wert muss eine ganzzahlige 32-Bit-Zahl (0..${MAX_UINT32}) sein.`
      );
    }

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

  getSubnetExample(cidrSuffix: number): SubnetExampleProfile {
    const cidr = Math.min(32, Math.max(24, Math.floor(cidrSuffix)));
    const hostBits = 32 - cidr;
    const totalAddresses = Math.pow(2, hostBits);

    const basePrefix = "192.168.10.";
    const netStart = 0;

    if (cidr === 31) {
      // RFC 3021 Point-to-Point link: both addresses are usable interface hosts
      return {
        networkAddress: `${basePrefix}${netStart} (P2P-Link)`,
        firstHost: `${basePrefix}${netStart}`,
        lastHost: `${basePrefix}${netStart + 1}`,
        broadcastAddress: "Keine (RFC 3021)",
        totalAddresses: 2,
        usableHosts: 2,
        hostBits: 1,
      };
    }

    if (cidr === 32) {
      // Single host route: exactly 1 host IP
      return {
        networkAddress: `${basePrefix}${netStart} (Host-Route)`,
        firstHost: `${basePrefix}${netStart}`,
        lastHost: `${basePrefix}${netStart}`,
        broadcastAddress: "Keine (Host-Route)",
        totalAddresses: 1,
        usableHosts: 1,
        hostBits: 0,
      };
    }

    const networkAddress = `${basePrefix}${netStart}`;
    const broadcastAddress = `${basePrefix}${netStart + totalAddresses - 1}`;
    const firstHost = `${basePrefix}${netStart + 1}`;
    const lastHost = `${basePrefix}${netStart + totalAddresses - 2}`;
    const usableHosts = totalAddresses - 2;

    return {
      networkAddress,
      firstHost,
      lastHost,
      broadcastAddress,
      totalAddresses,
      usableHosts,
      hostBits,
    };
  },
};
