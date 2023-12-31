import { Task } from '../interfaces';

export interface TaskQueue {
  readonly size: number;
  shift(): Task | Promise<Task> | null;
  remove(task: Task): Promise<void> | void;
  push(task: Task): Promise<void> | void;
}
