import { ArrayTaskQueue } from '../../src/task-queue/impl/array-task-queue';
import { TaskInfo } from '../../src/common/task';

describe('ArrayTaskQueue', () => {
  test('should be defined', () => {
    const instance = new ArrayTaskQueue();
    expect(instance).toBeInstanceOf(ArrayTaskQueue);
  });

  test('should have a size of 1', () => {
    const instance = new ArrayTaskQueue();
    const taskInfo = new TaskInfo({
      task: {},
      name: 'startWorker',
      triggerAsyncId: 1,
      filename: 'worker.js',
      channel: undefined,
      abortSignal: null,
      transferList: [],
      callback: (): void => {},
    });
    instance.push(taskInfo);
    expect(instance.size).toBe(1);
  });

  test('should have a size of 0', () => {
    const instance = new ArrayTaskQueue();
    expect(instance.size).toBe(0);
  });

  test('should shift a task', () => {
    const instance = new ArrayTaskQueue();
    const taskInfo = new TaskInfo({
      task: {},
      name: 'startWorker',
      triggerAsyncId: 1,
      filename: 'worker.js',
      channel: undefined,
      abortSignal: null,
      transferList: [],
      callback: (): void => {},
    });
    instance.push(taskInfo);
    const task = instance.shift();
    expect(task).toBeInstanceOf(TaskInfo);
  });

  test('should push a task', () => {
    const instance = new ArrayTaskQueue();
    const taskInfo = new TaskInfo({
      task: {},
      name: 'startWorker',
      triggerAsyncId: 1,
      filename: 'worker.js',
      channel: undefined,
      abortSignal: null,
      transferList: [],
      callback: (): void => {},
    });
    instance.push(taskInfo);
    expect(instance.size).toBe(1);
  });

  test('should remove a task', () => {
    const instance = new ArrayTaskQueue();
    const taskInfo = new TaskInfo({
      task: {},
      name: 'startWorker',
      triggerAsyncId: 1,
      filename: 'worker.js',
      channel: undefined,
      abortSignal: null,
      transferList: [],
      callback: (): void => {},
    });
    instance.push(taskInfo);
    instance.remove(taskInfo);
    expect(instance.size).toBe(0);
  });

  test('should not remove a task', () => {
    const instance = new ArrayTaskQueue();
    const taskInfo = new TaskInfo({
      task: {},
      name: 'startWorker',
      triggerAsyncId: 1,
      filename: 'worker.js',
      channel: undefined,
      abortSignal: null,
      transferList: [],
      callback: (): void => {},
    });
    instance.push(taskInfo);
    instance.remove({} as TaskInfo);
    expect(instance.size).toBe(1);
  });
});
