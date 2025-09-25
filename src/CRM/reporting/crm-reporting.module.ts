import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { TelephonyModule } from '@/modules/telephony/telephony.module';
import { CrmModule } from '../crm.module';
import { SalesPlanModule } from '../sales-plan/sales-plan.module';

import { Entity } from '../Model/Entity/Entity';
import { Task } from '../task';

import { CrmReportingService } from './crm-reporting.service';
import { ComparativeReportService } from './comparative/comparative-report.service';
import { ComparativeReportController } from './comparative/comparative-report.controller';
import { CustomerReportService } from './customer/customer-report.service';
import { CustomerReportController } from './customer/customer-report.controller';
import { DashboardController } from './dashboard/dashboard.controller';
import { DashboardService } from './dashboard/dashboard.service';
import { GeneralReportService } from './general/general-report.service';
import { GeneralReportController } from './general/general-report.controller';
import { ProjectReportService } from './project/project-report.service';
import { ProjectReportController } from './project/project-report.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Entity, Task]),
    IAMModule,
    forwardRef(() => CrmModule),
    forwardRef(() => SalesPlanModule),
    forwardRef(() => TelephonyModule),
  ],
  controllers: [
    ComparativeReportController,
    CustomerReportController,
    GeneralReportController,
    DashboardController,
    ProjectReportController,
  ],
  providers: [
    ComparativeReportService,
    CrmReportingService,
    CustomerReportService,
    DashboardService,
    GeneralReportService,
    ProjectReportService,
  ],
  exports: [CrmReportingService],
})
export class CrmReportingModule {}
