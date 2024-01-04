export class FileNameNotProvidedError extends Error {
  constructor() {
    super('filename must be provided to run() or in options object');
  }

  public get name(): string {
    return 'FileNameNotProvidedError';
  }
}
