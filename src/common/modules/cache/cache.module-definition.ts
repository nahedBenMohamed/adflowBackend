import { ConfigurableModuleBuilder } from '@nestjs/common';
import { CacheModuleOptions } from './interfaces';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder<CacheModuleOptions>()
  .setClassMethodName('forRoot')
  .build();
