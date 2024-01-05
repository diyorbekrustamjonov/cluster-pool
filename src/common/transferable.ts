import { Symbols } from './symbols';

export interface Transferable {
  readonly [Symbols.Task.kTransferable]: object;
  readonly [Symbols.Task.kValue]: object;
}

export class ArrayBufferViewTransferable implements Transferable {
  constructor(private readonly view: ArrayBufferView) {}

  get [Symbols.Task.kTransferable](): object {
    return this.view.buffer;
  }

  get [Symbols.Task.kValue](): object {
    return this.view;
  }
}

export class DirectlyTransferable implements Transferable {
  constructor(private readonly value: object) {}

  get [Symbols.Task.kTransferable](): object {
    return this.value;
  }

  get [Symbols.Task.kValue](): object {
    return this.value;
  }
}
