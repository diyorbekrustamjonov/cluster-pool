import assert from 'assert';

export abstract class AsynchronouslyCreatedResource {
  public onReadyListeners: (() => void)[] | null = [];

  public markAsReady(): void {
    const listeners = this.onReadyListeners;
    assert(listeners !== null);
    this.onReadyListeners = null;
    for (const listener of listeners) {
      listener();
    }
  }

  public isReady(): boolean {
    return this.onReadyListeners === null;
  }

  public onReady(fn: () => void): void {
    if (this.onReadyListeners === null) {
      fn();
      return;
    }
    this.onReadyListeners.push(fn);
  }

  abstract currentUsage(): number;
}

export class AsynchronouslyCreatedResourcePool<T extends AsynchronouslyCreatedResource> {
  private pendingItems = new Set<T>();
  private readyItems = new Set<T>();
  private onAvailableListeners: ((item: T) => void)[];

  public maximumUsage: number;

  constructor(maximumUsage: number) {
    this.maximumUsage = maximumUsage;
    this.onAvailableListeners = [];
  }

  public add(item: T): void {
    this.pendingItems.add(item);
    item.onReady(() => {
      if (this.pendingItems.has(item)) {
        this.pendingItems.delete(item);
        this.readyItems.add(item);
        this.maybeAvailable(item);
      }
    });
  }

  public delete(item: T): void {
    this.pendingItems.delete(item);
    this.readyItems.delete(item);
  }

  public findAvailable(): T | null {
    let minUsage = this.maximumUsage;
    let candidate = null;
    for (const item of this.readyItems) {
      const usage = item.currentUsage();
      if (usage === 0) return item;
      if (usage < minUsage) {
        candidate = item;
        minUsage = usage;
      }
    }
    return candidate;
  }

  public *[Symbol.iterator]() {
    yield* this.pendingItems;
    yield* this.readyItems;
  }

  public get size() {
    return this.pendingItems.size + this.readyItems.size;
  }

  public maybeAvailable(item: T): void {
    if (item.currentUsage() < this.maximumUsage) {
      for (const listener of this.onAvailableListeners) {
        listener(item);
      }
    }
  }

  public onAvailable(fn: (item: T) => void): void {
    this.onAvailableListeners.push(fn);
  }
}
