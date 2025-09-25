import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import analyticsConfig from './config/analytics.config';
import { AnalyticsService } from './analytics.service';

@Module({
  imports: [ConfigModule.forFeature(analyticsConfig)],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
