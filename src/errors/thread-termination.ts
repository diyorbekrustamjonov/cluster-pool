export class ThreadTerminationError extends Error {
  constructor() {
    super('Terminating worker thread');
  }

  public get name(): string {
    return 'ThreadTerminationError';
  }
}
