/** Injected wherever "now" matters, so tests can pin time. */
export type Clock = () => Date;

export const systemClock: Clock = () => new Date();
