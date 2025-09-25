import { registerAs } from '@nestjs/config';
import { LoggerOptions, LogLevel } from 'typeorm';

export interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  logging: LoggerOptions;
  cache: { type: string | undefined; duration: number | undefined };
}

const parseQueryLogging = (value: string | null | undefined): LoggerOptions | undefined => {
  if (!value) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'all') return 'all';

  return value.split(',').map((v) => v as LogLevel);
};

export default registerAs(
  'database',
  (): DatabaseConfig => ({
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    logging: parseQueryLogging(process.env.POSTGRES_QUERY_LOGGING),
    cache: {
      type: process.env.TYPEORM_CACHE_TYPE,
      duration: +process.env.TYPEORM_CACHE_DURATION,
    },
  }),
);
