import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';

import { AppsumoLicense, AppsumoTier } from './entities';
import { AppsumoController } from './appsumo.controller';
import { AppsumoService } from './appsumo.service';
import { ConfigModule } from '@nestjs/config';
import appsumoConfig from './config/appsumo.config';

@Module({
  imports: [ConfigModule.forFeature(appsumoConfig), TypeOrmModule.forFeature([AppsumoLicense, AppsumoTier]), IAMModule],
  providers: [AppsumoService],
  controllers: [AppsumoController],
  exports: [AppsumoService],
})
export class AppsumoModule {}
