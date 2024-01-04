export class TaskQueueAtLimitError extends Error {
  constructor() {
    super('Task queue is at limit');
  }

  public get name(): string {
    return 'TaskQueueAtLimitError';
  }
}
