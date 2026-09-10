export interface ValidationResult<T = string> {
  ok: boolean;
  clean?: T;
  error?: string;
}

/**
 * Validates that an input is an exact n-bit binary pattern.
 * Allows whitespace formatting (e.g. between 4-bit nibbles), but strictly rejects
 * patterns with fewer or more than `exactLength` bits.
 */
export function validateExactBitPattern(
  input: string,
  exactLength = 8
): ValidationResult<string> {
  const clean = input.replace(/\s+/g, "");
  if (!clean) {
    return { ok: false, error: "Eingabe darf nicht leer sein." };
  }
  if (!/^[01]+$/.test(clean)) {
    return {
      ok: false,
      error: "Ungültiges Binärmuster. Bitte nur '0' und '1' eingeben.",
    };
  }
  if (clean.length !== exactLength) {
    return {
      ok: false,
      error: `Bitte ein Muster mit exakt ${exactLength} Bit eingeben (deine Eingabe hat ${clean.length} Stellen).`,
    };
  }
  return { ok: true, clean };
}
