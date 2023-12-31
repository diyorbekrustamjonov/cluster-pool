import { TaskQueue } from '../task-queue';
import { Task } from '../../interfaces';

export class ArrayTaskQueue implements TaskQueue {
  tasks: Task[] = [];

  public get size(): number {
    return this.tasks.length;
  }

  public shift(): Task | null {
    return this.tasks.shift() as Task;
  }

  public push(task: Task): void {
    this.tasks.push(task);
  }

  public remove(task: Task): void {
    const taskIndex: number = this.tasks.indexOf(task);
    if (taskIndex >= 0) {
      this.tasks.splice(taskIndex, 1);
    }
  }
}
