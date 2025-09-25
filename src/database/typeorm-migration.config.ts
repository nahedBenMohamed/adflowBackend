import { DataSource, type DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

config({ path: `.env` });
config({ path: `.env.local`, override: true });

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST'),
  port: configService.get('POSTGRES_PORT'),
  username: configService.get('POSTGRES_USER'),
  password: configService.get('POSTGRES_PASSWORD'),
  database: configService.get('POSTGRES_DB'),
  namingStrategy: new SnakeNamingStrategy(),
  migrations: ['./src/database/migrations/*.ts'],
  logging: true,
} as DataSourceOptions);
