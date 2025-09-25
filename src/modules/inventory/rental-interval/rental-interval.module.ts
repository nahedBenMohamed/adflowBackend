import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';

import { RentalIntervalService } from './rental-interval.service';
import { RentalIntervalController } from './rental-interval.controller';
import { RentalInterval } from './entities/rental-interval.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RentalInterval]), IAMModule],
  controllers: [RentalIntervalController],
  providers: [RentalIntervalService],
  exports: [RentalIntervalService],
})
export class RentalIntervalModule {}
