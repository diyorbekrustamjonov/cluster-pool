import assert from 'assert';
import { NovaPoolWorker } from '../interfaces';
import { TaskInfo } from './task';
import { MessagePort, receiveMessageOnPort } from 'worker_threads';
import { RequestMessage, ResponseCallback, ResponseMessage } from '../interfaces';
import { kFieldCount, kRequestCountField, kResponseCountField } from '../constants';
import { ThreadTerminationError } from '../errors/thread-termination';
import { AsynchronouslyCreatedResource } from '../pools/async-created-resource-pool';

export class WorkerInfo extends AsynchronouslyCreatedResource {
  worker: NovaPoolWorker;
  workerId: number;
  freeWorkerId: () => void;
  taskInfos: Map<number, TaskInfo>;
  idleTimeout: NodeJS.Timeout | null = null;
  port: MessagePort;
  sharedBuffer: Int32Array;
  lastSeenResponseCount: number = 0;
  usedMemory?: number;
  onMessage: ResponseCallback;
  shouldRecycle?: boolean;

  constructor(
    worker: NovaPoolWorker,
    port: MessagePort,
    workerId: number,
    freeWorkerId: () => void,
    onMessage: ResponseCallback
  ) {
    super();
    this.worker = worker;
    this.workerId = workerId;
    this.freeWorkerId = freeWorkerId;
    this.port = port;
    this.port.on('message', (message: ResponseMessage) => this._handleResponse(message));
    this.onMessage = onMessage;
    this.taskInfos = new Map();
    this.sharedBuffer = new Int32Array(new SharedArrayBuffer(kFieldCount * Int32Array.BYTES_PER_ELEMENT));
  }

  public async destroy(timeout?: number): Promise<void> {
    let resolve: () => void;
    let reject: (err: Error) => void;

    const ret = new Promise<void>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const timer = timeout ? setTimeout(() => reject(new Error('Failed to terminate worker')), timeout) : null;

    this.worker.terminate().then(() => {
      if (timer !== null) {
        clearTimeout(timer);
      }

      this.port.close();
      this.clearIdleTimeout();
      for (const taskInfo of this.taskInfos.values()) {
        taskInfo.done(new ThreadTerminationError());
      }
      this.taskInfos.clear();

      resolve();
    });

    return ret;
  }

  public clearIdleTimeout(): void {
    if (this.idleTimeout !== null) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
  }

  public ref(): WorkerInfo {
    this.port.ref();
    return this;
  }

  public unref(): WorkerInfo {
    this.port.unref();
    return this;
  }

  public _handleResponse(message: ResponseMessage): void {
    this.usedMemory = message.usedMemory;
    this.onMessage(message);

    if (this.taskInfos.size === 0) {
      this.unref();
    }
  }

  public postTask(taskInfo: TaskInfo): void {
    assert(!this.taskInfos.has(taskInfo.taskId));
    const message: RequestMessage = {
      task: taskInfo.releaseTask(),
      taskId: taskInfo.taskId,
      filename: taskInfo.filename,
      name: taskInfo.name,
    };

    try {
      if (taskInfo.channel) {
        this.worker.setChannel?.(taskInfo.channel);
      }
      this.port.postMessage(message, taskInfo.transferList);
    } catch (err) {
      taskInfo.done(err);
      return;
    }

    taskInfo.workerInfo = this;
    this.taskInfos.set(taskInfo.taskId, taskInfo);
    this.ref();
    this.clearIdleTimeout();

    Atomics.add(this.sharedBuffer, kRequestCountField, 1);
    Atomics.notify(this.sharedBuffer, kRequestCountField, 1);
  }

  public processPendingMessages(): void {
    const actualResponseCount = Atomics.load(this.sharedBuffer, kResponseCountField);
    if (actualResponseCount !== this.lastSeenResponseCount) {
      this.lastSeenResponseCount = actualResponseCount;

      let entry;
      while ((entry = receiveMessageOnPort(this.port)) !== undefined) {
        this._handleResponse(entry.message);
      }
    }
  }

  public isRunningAbortableTask(): boolean {
    if (this.taskInfos.size !== 1) return false;
    const [[, task]] = this.taskInfos;
    return task.abortSignal !== null;
  }

  public currentUsage(): number {
    if (this.isRunningAbortableTask()) return Infinity;
    return this.taskInfos.size;
  }
}
