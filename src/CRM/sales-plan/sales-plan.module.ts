import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { CrmModule } from '../crm.module';

import { CrmReportingModule } from '../reporting/crm-reporting.module';
import { SalesPlan } from './entities/sales-plan.entity';
import { SalesPlanService } from './sales-plan.service';
import { SalesPlanController } from './sales-plan.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalesPlan]),
    IAMModule,
    forwardRef(() => CrmModule),
    forwardRef(() => CrmReportingModule),
  ],
  controllers: [SalesPlanController],
  providers: [SalesPlanService],
  exports: [SalesPlanService],
})
export class SalesPlanModule {}
