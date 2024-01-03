import {
  AbortSignalEventEmitter,
  AbortSignalEventTargetOrEventEmitter,
  NovaPoolChannel,
  Task,
  TaskCallback,
  TransferList,
} from '../interfaces';
import { performance } from 'perf_hooks';
import { Symbols } from './symbols';
import { isMovable } from './utils';
import { AsyncResource } from 'async_hooks';
import { WorkerInfo } from './worker-info';
import { CancelError } from '../errors/cancel-error';

let taskIdCounter = 0;

export class TaskInfo extends AsyncResource implements Task {
  public callback: TaskCallback;
  public task: any;
  public transferList: TransferList;
  public channel?: NovaPoolChannel;
  public filename: string;
  public name: string;
  public taskId: number;
  public abortSignal: AbortSignalEventTargetOrEventEmitter | null;
  public abortListener: (() => void) | null = null;
  public workerInfo: WorkerInfo | null = null;
  public created: number;
  public started: number;
  public cancel: () => void;

  constructor(params: {
    task: any;
    transferList: TransferList;
    filename: string;
    name: string;
    callback: TaskCallback;
    abortSignal: AbortSignalEventTargetOrEventEmitter | null;
    triggerAsyncId: number;
    channel?: NovaPoolChannel;
  }) {
    super(Symbols.Task.kTask.toString(), { requireManualDestroy: true, triggerAsyncId: params.triggerAsyncId });
    this.callback = params.callback;
    this.task = params.task;
    this.transferList = params.transferList;
    this.cancel = (): void => this.callback(new CancelError(), null);
    this.channel = params.channel;

    if (isMovable(this.task)) {
      this.transferList = this.transferList || [];
      this.transferList = this.transferList.concat(this.task[Symbols.Task.kTransferable]);
      this.task = this.task[Symbols.Task.kValue];
    }

    this.filename = params.filename;
    this.name = params.name;
    this.taskId = taskIdCounter++;
    this.abortSignal = params.abortSignal;
    this.created = performance.now();
    this.started = 0;
  }

  public releaseTask(): any {
    const ret = this.task;
    this.task = null;
    return ret;
  }

  public done(err: unknown | null, result?: any): void {
    this.emitDestroy();
    this.runInAsyncScope(this.callback, null, err, result);
    if (this.abortSignal && this.abortListener) {
      if ('removeEventListener' in this.abortSignal && this.abortListener) {
        this.abortSignal.removeEventListener('abort', this.abortListener);
      } else {
        (this.abortSignal as AbortSignalEventEmitter).off('abort', this.abortListener);
      }
    }
  }
}
