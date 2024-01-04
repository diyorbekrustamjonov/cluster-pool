export class NoTaskQueueAvailableError extends Error {
  constructor() {
    super('No task queue available and all Workers are busy');
  }

  public get name(): string {
    return 'NoTaskQueueAvailableError';
  }
}
