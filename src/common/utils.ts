import { Symbols } from './symbols';

export function isTransferable(value: any): boolean {
  return (
    value != null && typeof value === 'object' && Symbols.Task.kTransferable in value && Symbols.Task.kValue in value
  );
}

export function isMovable(value: any): boolean {
  return isTransferable(value) && value[Symbols.Task.kMovable] === true;
}
