/**
 * Domain errors thrown by services and repositories. They carry no HTTP or
 * React knowledge; Server Actions and pages translate them via runAction (src/server/action-result.ts).
 */
export abstract class AppError extends Error {
  abstract readonly code: 'NOT_FOUND' | 'CONFLICT' | 'BUSINESS_RULE';

  constructor(
    message: string,
    /** Form field the error relates to, when there is one. */
    readonly field?: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND';

  constructor(resource: string, id: string | number) {
    super(`${resource} ${id} was not found`);
  }
}

export class ConflictError extends AppError {
  readonly code = 'CONFLICT';
}

export class BusinessRuleError extends AppError {
  readonly code = 'BUSINESS_RULE';
}
