export type ModuleType = "dec2bin" | "bin2dec" | "hex" | "subnet" | "explainer";
export type HexSubMode = "bin2hex" | "hex2bin" | "dec2hex" | "hex2dec";
export type SubnetTaskType = "cidr2mask" | "mask2bin" | "magicNumber";

export const VALID_MODULES: readonly ModuleType[] = [
  "dec2bin",
  "bin2dec",
  "hex",
  "subnet",
  "explainer",
] as const;

export const VALID_HEX_SUBMODES: readonly HexSubMode[] = [
  "bin2hex",
  "hex2bin",
  "dec2hex",
  "hex2dec",
] as const;

export const VALID_SUBNET_TASK_TYPES: readonly SubnetTaskType[] = [
  "cidr2mask",
  "mask2bin",
  "magicNumber",
] as const;

export interface ParsedUrlState {
  module: ModuleType;
  hexSubMode: HexSubMode;
  subnetTaskType: SubnetTaskType;
}

export const DEFAULT_URL_STATE: ParsedUrlState = {
  module: "dec2bin",
  hexSubMode: "bin2hex",
  subnetTaskType: "cidr2mask",
};

/**
 * Pure, robust URL state parser with strict type checks and normalization.
 * Unknown or invalid parameters fall back safely to defaults.
 */
export function parseUrlState(params: URLSearchParams): ParsedUrlState {
  const modParam = params.get("module") as ModuleType | null;
  const subParam = params.get("sub");

  let activeModule: ModuleType = DEFAULT_URL_STATE.module;
  if (modParam && VALID_MODULES.includes(modParam)) {
    activeModule = modParam;
  }

  let hexSubMode: HexSubMode = DEFAULT_URL_STATE.hexSubMode;
  let subnetTaskType: SubnetTaskType = DEFAULT_URL_STATE.subnetTaskType;

  if (subParam) {
    if (activeModule === "hex" && (VALID_HEX_SUBMODES as readonly string[]).includes(subParam)) {
      hexSubMode = subParam as HexSubMode;
    } else if (activeModule === "subnet" && (VALID_SUBNET_TASK_TYPES as readonly string[]).includes(subParam)) {
      subnetTaskType = subParam as SubnetTaskType;
    }
    // If sub doesn't match active module, keep default for that module
  }

  return {
    module: activeModule,
    hexSubMode,
    subnetTaskType,
  };
}
