export class AbortError extends Error {
  constructor() {
    super('The task has been aborted');
  }

  public get name(): string {
    return 'AbortError';
  }
}
