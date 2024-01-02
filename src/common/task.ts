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
  callback: TaskCallback;
  task: any;
  transferList: TransferList;
  channel?: NovaPoolChannel;
  filename: string;
  name: string;
  taskId: number;
  abortSignal: AbortSignalEventTargetOrEventEmitter | null;
  abortListener: (() => void) | null = null;
  workerInfo: WorkerInfo | null = null;
  created: number;
  started: number;
  cancel: () => void;

  constructor(
    task: any,
    transferList: TransferList,
    filename: string,
    name: string,
    callback: TaskCallback,
    abortSignal: AbortSignalEventTargetOrEventEmitter | null,
    triggerAsyncId: number,
    channel?: NovaPoolChannel
  ) {
    super(Symbols.Task.kTask.toString(), { requireManualDestroy: true, triggerAsyncId });
    this.callback = callback;
    this.task = task;
    this.transferList = transferList;
    this.cancel = (): void => this.callback(new CancelError(), null);
    this.channel = channel;

    // If the task is a Transferable returned by
    // Piscina.move(), then add it to the transferList
    // automatically
    if (isMovable(task)) {
      // This condition should never be hit but typescript
      // complains if we dont do the check.
      /* istanbul ignore if */
      if (this.transferList == null) {
        this.transferList = [];
      }
      this.transferList = this.transferList.concat(task[Symbols.Task.kTransferable]);
      this.task = task[Symbols.Task.kValue];
    }

    this.filename = filename;
    this.name = name;
    this.taskId = taskIdCounter++;
    this.abortSignal = abortSignal;
    this.created = performance.now();
    this.started = 0;
  }

  public releaseTask(): any {
    const ret = this.task;
    this.task = null;
    return ret;
  }

  public done(err: unknown | null, result?: any): void {
    this.emitDestroy(); // `TaskInfo`s are used only once.
    this.runInAsyncScope(this.callback, null, err, result);
    // If an abort signal was used, remove the listener from it when
    // done to make sure we do not accidentally leak.
    if (this.abortSignal && this.abortListener) {
      if ('removeEventListener' in this.abortSignal && this.abortListener) {
        this.abortSignal.removeEventListener('abort', this.abortListener);
      } else {
        (this.abortSignal as AbortSignalEventEmitter).off('abort', this.abortListener);
      }
    }
  }
}
