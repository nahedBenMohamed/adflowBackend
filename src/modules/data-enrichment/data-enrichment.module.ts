import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { IAMModule } from '@/modules/iam/iam.module';

import dataEnrichmentConfig from './config/data-enrichment.config';
import { DataEnrichmentService } from './data-enrichment.service';
import { DataEnrichmentController } from './data-enrichment.controller';

@Module({
  imports: [ConfigModule.forFeature(dataEnrichmentConfig), IAMModule],
  providers: [DataEnrichmentService],
  controllers: [DataEnrichmentController],
})
export class DataEnrichmentModule {}
