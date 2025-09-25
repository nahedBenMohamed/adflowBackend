import { CacheProviderType } from '../types';
import { IORedisProviderOptions } from './ioredis-provider.interface';

export interface CacheServiceOptions {
  type: CacheProviderType;

  options?: IORedisProviderOptions | null;
}
