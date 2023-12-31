import { Symbols } from '../common/symbols';

export interface Task {
  readonly [Symbols.Task.kQueueOptions]: object | null;
}
