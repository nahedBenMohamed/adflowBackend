import Redis from 'ioredis';
import { IORedisProviderOptions, Store } from '../interfaces';

export class IORedisProvider implements Store {
  private redis: Redis;

  constructor(options?: IORedisProviderOptions) {
    this.redis = new Redis(options);
  }

  async get<T>(key: string): Promise<T | undefined> {
    const value = await this.redis.get(key);
    if (value !== undefined && value !== null) {
      return JSON.parse(value) as T;
    }

    return undefined;
  }

  async set<T>(key: string, value: T, seconds?: number): Promise<void> {
    const valueStr = JSON.stringify(value);
    if (seconds) {
      await this.redis.setex(key, seconds, valueStr);
    } else {
      await this.redis.set(key, valueStr);
    }
  }

  async del(key: string): Promise<boolean> {
    const result = await this.redis.del(key);

    return result > 0;
  }

  async clear(): Promise<boolean> {
    const result = await this.redis.flushdb();

    return result === 'OK';
  }

  async wrap<T>(key: string, fn: () => Promise<T>, seconds?: number): Promise<T> {
    const value = await this.get<T>(key);
    if (value !== undefined) {
      return value;
    }

    const result = await fn();
    await this.set(key, result, seconds);

    return result;
  }
}
