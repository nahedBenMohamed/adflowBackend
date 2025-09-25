import { registerAs } from '@nestjs/config';
import { CacheProviderType } from '../modules/cache/types';

interface IORedisConfig {
  host: string;
  port: number;
}
interface CacheConfig {
  type?: CacheProviderType;
  ioredis?: IORedisConfig;
}
export interface CommonConfig {
  cache?: CacheConfig;
}

export default registerAs(
  'common',
  (): CommonConfig => ({
    cache: {
      type: process.env.CACHE_TYPE as CacheProviderType,
      ioredis: {
        host: process.env.CACHE_IOREDIS_HOST,
        port: +process.env.CACHE_IOREDIS_PORT,
      },
    },
  }),
);
