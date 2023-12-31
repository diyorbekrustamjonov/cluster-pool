export interface NovaPoolOptions {
  filename: string | null;
  minThread: number | null;
  minThreads?: number;
  maxThreads?: number;
  idleTimeout?: number;
  maxQueue?: number | 'auto';
}

export class NovaPool {
  constructor(private readonly options: NovaPoolOptions) {
    if (!this.options.filename) {
      throw new Error('FileName not found');
    }
  }
}
