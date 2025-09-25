import { Module } from '@nestjs/common';
import { ConditionalModule, ConfigModule } from '@nestjs/config';

import supportConfig from './config/support.config';
import { HeapdumpModule } from './heapdump';
import { HealthModule } from './health';
import { VersionModule } from './version';

@Module({
  imports: [
    ConfigModule.forFeature(supportConfig),
    ConditionalModule.registerWhen(HeapdumpModule, 'SUPPORT_HEAPDUMP_ENABLED'),
    ConditionalModule.registerWhen(HealthModule, 'SUPPORT_HEALTH_ENABLED'),
    VersionModule,
  ],
})
export class SupportModule {}
