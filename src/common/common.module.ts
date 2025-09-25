import { Global, Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';

import commonConfig, { CommonConfig } from './config/common.config';
import { CacheModule, GlobalHttpModule, TokenModule, UrlGeneratorModule } from './modules';

import { AllExceptionsFilter } from './filters';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forFeature(commonConfig),
    CacheModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const config = configService.get<CommonConfig>('common');
        return {
          type: config.cache?.type,
          options:
            config.cache?.type === 'ioredis'
              ? { host: config.cache?.ioredis?.host, port: config.cache?.ioredis?.port }
              : undefined,
        };
      },
    }),
    GlobalHttpModule,
    TokenModule,
    UrlGeneratorModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () => {
        return new ValidationPipe({
          transform: true,
          transformOptions: { enableImplicitConversion: true },
          //whitelist: true,
        });
      },
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  exports: [CacheModule, TokenModule, UrlGeneratorModule],
})
export class CommonModule {}
