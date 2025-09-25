import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ConfigurableModuleClass } from './cache.module-definition';

@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule extends ConfigurableModuleClass {}
