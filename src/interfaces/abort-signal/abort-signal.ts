export interface AbortSignalEventTargetAddOptions {
  once: boolean;
}

export interface AbortSignalEventTarget {
  addEventListener: (name: 'abort', listener: () => void, options?: AbortSignalEventTargetAddOptions) => void;
  removeEventListener: (name: 'abort', listener: () => void) => void;
  aborted?: boolean;
  reason?: unknown;
}
export interface AbortSignalEventEmitter {
  off: (name: 'abort', listener: () => void) => void;
  once: (name: 'abort', listener: () => void) => void;
}

export type AbortSignalEventTargetOrEventEmitter = AbortSignalEventTarget | AbortSignalEventEmitter;
