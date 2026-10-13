const EDGE_PADDING = 0.03;

/**
 * Shared scale for a list of pay bands, so rows compare directly. Padded a
 * little so a dot at the extreme never sits on the edge.
 */
export function bandDomain(rows: Array<{ min: number; max: number }>): [number, number] {
  if (rows.length === 0) return [0, 1];
  const lo = Math.min(...rows.map((row) => row.min));
  const hi = Math.max(...rows.map((row) => row.max));
  const pad = (hi - lo) * EDGE_PADDING;
  return [Math.max(0, lo - pad), hi + pad];
}
