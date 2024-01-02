import { NovaPoolChannel, NovaPoolData } from '../pool';
import { TransferListItem } from '../task';

export interface NovaPoolWorker {
  runtime: string;
  threadId: number;
  initialize(options: {
    env?: Record<string, string>;
    argv?: string[];
    execArgv?: string[];
    resourceLimits?: any;
    workerData?: NovaPoolData;
    trackUnmanagedFds?: boolean;
  }): void;
  terminate(): Promise<any>;
  postMessage(message: any, transferListItem?: TransferListItem[]): void;
  setChannel?: (channel: NovaPoolChannel) => void;
  on(event: string, listener: (...args: any[]) => void): void;
  once(event: string, listener: (...args: any[]) => void): void;
  emit(event: string, ...data: any[]): void;
  ref?: () => void;
  unref?: () => void;
}
