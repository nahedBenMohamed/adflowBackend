import { Inject } from '@nestjs/common';
import { CacheServiceOptions, IORedisProviderOptions, Store } from './interfaces';
import { IORedisProvider, StubProvider } from './providers';
import { MODULE_OPTIONS_TOKEN } from './cache.module-definition';

export class CacheService implements Store {
  private readonly store: Store;

  constructor(@Inject(MODULE_OPTIONS_TOKEN) private readonly options?: CacheServiceOptions) {
    const type = this.options?.type || 'stub';
    switch (type) {
      case 'ioredis':
        this.store = new IORedisProvider(options?.options as IORedisProviderOptions);
        break;
      default:
        this.store = new StubProvider();
        break;
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    return this.store.get(key);
  }
  async set<T>(key: string, value: T, seconds?: number): Promise<void> {
    return this.store.set(key, value, seconds);
  }
  async del(key: string): Promise<boolean> {
    return this.store.del(key);
  }
  async clear(): Promise<boolean> {
    return this.store.clear();
  }
  async wrap<T>(key: string, fn: () => Promise<T>, seconds?: number): Promise<T> {
    return this.store.wrap(key, fn, seconds);
  }
}
