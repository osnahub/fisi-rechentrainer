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

  getPolynomialExpansion(binStr: string): PolynomialTerm[] {
    const clean = binStr.replace(/\s+/g, "");
    const terms: PolynomialTerm[] = [];
    const len = clean.length;

    for (let i = 0; i < len; i++) {
      const bit = Number(clean[i]) || 0;
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
    const steps: StellenwertStep[] = [];
    let remainder = Math.max(0, Math.floor(decimalNumber));

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
        isMSB: false, // will update last element
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
    // Clamped between 24 and 32
    const cidr = Math.min(32, Math.max(24, cidrSuffix));
    const hostBits = 32 - cidr;
    const totalAddresses = Math.pow(2, hostBits);

    const basePrefix = "192.168.10.";
    const netStart = 0;

    if (cidr === 31) {
      // RFC 3021 Point-to-Point link: both addresses are usable hosts, no separate broadcast
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
      // Host-Route / Loopback: exactly 1 single host IP
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

