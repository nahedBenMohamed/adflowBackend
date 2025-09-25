import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';

import { Industry } from './entities/industry.entity';
import { ReadyMadeSolution } from './entities/ready-made-solution.entity';
import { IndustryService } from './services/industry.service';
import { RmsService } from './services/rms.service';
import { RmsController } from './rms.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Industry, ReadyMadeSolution]), IAMModule],
  controllers: [RmsController],
  providers: [RmsService, IndustryService],
  exports: [RmsService],
})
export class RmsModule {}
