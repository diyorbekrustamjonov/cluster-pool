export class CancelError extends Error {
  constructor() {
    super('The task has been cancelled');
  }

  public get name(): string {
    return 'CancelError';
  }
}
