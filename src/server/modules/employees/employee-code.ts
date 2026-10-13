const PREFIX = 'EMP-';
const DIGITS = 6;
const MAX_INT4 = 2_147_483_647;

/** 42 → "EMP-000042". The DB stores only the sequential number. */
export function formatEmployeeCode(employeeNumber: number): string {
  return `${PREFIX}${String(employeeNumber).padStart(DIGITS, '0')}`;
}

/** Accepts "EMP-000042", "emp42" or "42"; returns null for anything else. */
export function parseEmployeeCode(input: string): number | null {
  const match = /^(?:emp-?)?(\d{1,10})$/i.exec(input.trim());
  if (!match) return null;
  const value = Number(match[1]);
  return value > 0 && value <= MAX_INT4 ? value : null;
}
