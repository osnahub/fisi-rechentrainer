import { describe, it, expect } from "vitest";
import { parseUrlState, VALID_MODULES } from "@/lib/urlState";

describe("URL State Parser (Befund 5)", () => {
  it("returns default state when search params are empty", () => {
    const params = new URLSearchParams("");
    const state = parseUrlState(params);
    expect(state).toEqual({
      module: "dec2bin",
      hexSubMode: "bin2hex",
      subnetTaskType: "cidr2mask",
    });
  });

  it("parses valid module and valid sub modes", () => {
    const paramsHex = new URLSearchParams("module=hex&sub=dec2hex");
    expect(parseUrlState(paramsHex)).toEqual({
      module: "hex",
      hexSubMode: "dec2hex",
      subnetTaskType: "cidr2mask",
    });

    const paramsSubnet = new URLSearchParams("module=subnet&sub=magicNumber");
    expect(parseUrlState(paramsSubnet)).toEqual({
      module: "subnet",
      hexSubMode: "bin2hex",
      subnetTaskType: "magicNumber",
    });
  });

  it("normalizes invalid or cross-module sub params to defaults", () => {
    // sub=magicNumber belongs to subnet, not hex
    const paramsHexInvalidSub = new URLSearchParams("module=hex&sub=magicNumber");
    expect(parseUrlState(paramsHexInvalidSub)).toEqual({
      module: "hex",
      hexSubMode: "bin2hex", // normalized to default hex submode
      subnetTaskType: "cidr2mask",
    });

    // unknown sub
    const paramsUnknown = new URLSearchParams("module=hex&sub=nonsense");
    expect(parseUrlState(paramsUnknown)).toEqual({
      module: "hex",
      hexSubMode: "bin2hex",
      subnetTaskType: "cidr2mask",
    });
  });

  it("normalizes unknown module to dec2bin default", () => {
    const params = new URLSearchParams("module=hacker&sub=something");
    expect(parseUrlState(params)).toEqual({
      module: "dec2bin",
      hexSubMode: "bin2hex",
      subnetTaskType: "cidr2mask",
    });
  });

  it("exports VALID_MODULES list", () => {
    expect(VALID_MODULES).toEqual(["dec2bin", "bin2dec", "hex", "subnet", "explainer"]);
  });
});
