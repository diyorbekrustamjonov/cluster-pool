import { MessagePort } from 'worker_threads';

export type TransferList = MessagePort extends { postMessage(value: any, transferList: infer T): any } ? T : never;

export type TransferListItem = TransferList extends (infer T)[] ? T : never;
