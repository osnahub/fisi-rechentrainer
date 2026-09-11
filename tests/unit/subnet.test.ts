import { describe, it, expect } from "vitest";
import { SUBNET_TABLE, isValidSubnetMaskAnswer } from "@/lib/subnetData";

describe("Subnet - Bug Reproductions (P0/P1)", () => {
  it("REPRODUCE P0: /25 must reject 1.2.3.128", () => {
    // Current bug: 1.2.3.128 is accepted because it splits by dot and looks only at the last part!
    expect(isValidSubnetMaskAnswer("1.2.3.128", 128)).toBe(false);
  });

  it("accepts exactly the requested octet or exactly 255.255.255.X", () => {
    expect(isValidSubnetMaskAnswer("128", 128)).toBe(true);
    expect(isValidSubnetMaskAnswer("255.255.255.128", 128)).toBe(true);
    expect(isValidSubnetMaskAnswer(" 128 ", 128)).toBe(true);
    expect(isValidSubnetMaskAnswer(" 255.255.255.128 ", 128)).toBe(true);
  });

  it("rejects invalid mask inputs", () => {
    const invalids = [
      "1.2.3.128",
      "0.0.0.128",
      "255.255.255",
      "255.255.255.",
      ".128",
      "255.255.255.128.0",
      "255.255.255.128.",
      "abc",
      "",
      "256",
      "-1",
    ];
    for (const inv of invalids) {
      expect(isValidSubnetMaskAnswer(inv, 128), `Expected '${inv}' to be rejected`).toBe(false);
    }
  });
});

describe("SUBNET_TABLE - Data Consistency and RFC 3021 Accuracy", () => {
  it("contains all 9 subnets from /24 to /32", () => {
    expect(SUBNET_TABLE).toHaveLength(9);
    const prefixes = SUBNET_TABLE.map((e) => e.prefixLen);
    expect(prefixes).toEqual([24, 25, 26, 27, 28, 29, 30, 31, 32]);
  });

  it("uses totalAddresses instead of totalHosts", () => {
    for (const entry of SUBNET_TABLE) {
      expect(entry).toHaveProperty("totalAddresses");
      expect(entry.totalAddresses).toBe(Math.pow(2, entry.hostBits));
    }
  });

  it("has correct magic numbers and binary octets for all rows", () => {
    const expected = [
      { cidr: "/24", mask: 0, bin: "00000000", magic: 256, addrs: 256, usable: 254 },
      { cidr: "/25", mask: 128, bin: "10000000", magic: 128, addrs: 128, usable: 126 },
      { cidr: "/26", mask: 192, bin: "11000000", magic: 64, addrs: 64, usable: 62 },
      { cidr: "/27", mask: 224, bin: "11100000", magic: 32, addrs: 32, usable: 30 },
      { cidr: "/28", mask: 240, bin: "11110000", magic: 16, addrs: 16, usable: 14 },
      { cidr: "/29", mask: 248, bin: "11111000", magic: 8, addrs: 8, usable: 6 },
      { cidr: "/30", mask: 252, bin: "11111100", magic: 4, addrs: 4, usable: 2 },
      { cidr: "/31", mask: 254, bin: "11111110", magic: 2, addrs: 2, usable: 2 },
      { cidr: "/32", mask: 255, bin: "11111111", magic: 1, addrs: 1, usable: 1 },
    ];

    expected.forEach((exp, idx) => {
      const row = SUBNET_TABLE[idx];
      expect(row.cidr).toBe(exp.cidr);
      expect(row.maskOctet).toBe(exp.mask);
      expect(row.binaryOctet).toBe(exp.bin);
      expect(row.magicNumber).toBe(exp.magic);
      expect(row.totalAddresses).toBe(exp.addrs);
      expect(row.usableHosts).toBe(exp.usable);
    });
  });

  it("/24 does NOT mention Standard-C-Klasse in notes", () => {
    const row24 = SUBNET_TABLE.find((e) => e.prefixLen === 24);
    expect(row24?.notes).not.toContain("Standard-C-Klasse");
  });

  it("/31 specifies RFC 3021 and 2 usable interface addresses", () => {
    const row31 = SUBNET_TABLE.find((e) => e.prefixLen === 31);
    expect(row31?.usableHosts).toBe(2);
    expect(row31?.notes).toContain("RFC 3021");
  });

  it("/32 specifies Host-Route without loopback generalization", () => {
    const row32 = SUBNET_TABLE.find((e) => e.prefixLen === 32);
    expect(row32?.usableHosts).toBe(1);
    expect(row32?.notes.toLowerCase()).toContain("host-route");
  });
});
