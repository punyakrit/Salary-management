/** `YYYY-MM-DD` in UTC. Postgres DATE columns round-trip as UTC midnight. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** "13 Oct 2026" — unambiguous across US/UK readers. */
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** "6 years", "8 months", "Less than a month" — how long someone has been here. */
export function formatTenure(hireIsoDate: string, now: Date): string {
  const hired = new Date(hireIsoDate);
  let months =
    (now.getUTCFullYear() - hired.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - hired.getUTCMonth());
  if (now.getUTCDate() < hired.getUTCDate()) months -= 1;

  if (months < 1) return 'Less than a month';
  if (months < 12) return `${months} ${months === 1 ? 'month' : 'months'}`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? 'year' : 'years'}`;
}
