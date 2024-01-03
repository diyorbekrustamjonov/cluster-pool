export interface NovaPoolChannel {
  onMessage(callback: (message: any) => void): void;
  postMessage(message: any): void;
}
