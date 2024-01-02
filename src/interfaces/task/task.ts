export interface RequestMessage {
  taskId: number;
  task: any;
  filename: string;
  name: string;
}

export interface Task {
  done(err: unknown | null, result?: any): void;
  cancel(): void;
  releaseTask(): any;
}
