import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import databaseConfig, { DatabaseConfig } from './config/database.config';
import { SequenceIdService } from './services';
import { NestjsLogger } from './nestjs-logger';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule.forFeature(databaseConfig)],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<DatabaseConfig>('database');

        return {
          type: 'postgres',
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          database: config.database,
          namingStrategy: new SnakeNamingStrategy(),
          entities: [__dirname + '/../**/Model/**/*.{js,ts}', __dirname + '/../**/entities/*.entity.{js,ts}'],
          maxQueryExecutionTime: 1000,
          logging: config.logging,
          logger: config.logging ? new NestjsLogger() : undefined,
          cache:
            config.cache.type === 'ioredis'
              ? {
                  type: 'ioredis',
                  options: {
                    host: '127.0.0.1',
                    port: 6379,
                  },
                  duration: config.cache.duration,
                }
              : undefined,
        };
      },
    }),
  ],
  providers: [SequenceIdService],
  exports: [SequenceIdService],
})
export class DatabaseModule {}
