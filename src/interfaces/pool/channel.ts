export interface NovaPoolChannel {
  // Workers subscribe to this event
  onMessage(callback: (message: any) => void): void;

  // Called with worker's messages
  postMessage(message: any): void;
}
