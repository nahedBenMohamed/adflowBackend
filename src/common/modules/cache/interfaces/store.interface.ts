export interface Store {
  get: <T>(key: string) => Promise<T | undefined>;
  set: <T>(key: string, value: T, seconds?: number) => Promise<void>;
  del: (key: string) => Promise<boolean>;
  clear: () => Promise<boolean>;
  wrap: <T>(key: string, fn: () => Promise<T>, seconds?: number) => Promise<T>;
}
