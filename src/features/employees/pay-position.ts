export type PayPosition =
  { direction: 'at'; percent: 0 } | { direction: 'above' | 'below'; percent: number };

/** Within half a percent counts as "at" the typical salary. */
const AT_TYPICAL_TOLERANCE = 0.005;

/** How a salary compares with the typical (median) salary of its peers. */
export function payPosition(salary: number, typical: number): PayPosition {
  const delta = (salary - typical) / typical;
  if (Math.abs(delta) < AT_TYPICAL_TOLERANCE) return { direction: 'at', percent: 0 };
  return { direction: delta > 0 ? 'above' : 'below', percent: Math.round(Math.abs(delta) * 100) };
}

export function describePayPosition(position: PayPosition): string {
  return position.direction === 'at'
    ? 'At the typical salary'
    : `${position.percent}% ${position.direction} typical`;
}
