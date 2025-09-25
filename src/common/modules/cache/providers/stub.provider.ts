import { Store } from '../interfaces';

export class StubProvider implements Store {
  get = async () => undefined;
  set = async () => null;
  del = async () => true;
  clear = async () => true;
  wrap = async <T>(_: string, fn: () => Promise<T>) => fn();
}
