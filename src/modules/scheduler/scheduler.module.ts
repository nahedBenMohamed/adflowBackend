import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { EntityInfoModule } from '@/modules/entity/entity-info/entity-info.module';
import { InventoryModule } from '@/modules/inventory/inventory.module';
import { CrmModule } from '@/CRM/crm.module';

import {
  Schedule,
  ScheduleController,
  ScheduleService,
  ScheduleTimeInterval,
  ScheduleTimeIntervalService,
} from './schedule';
import {
  ScheduleAppointment,
  ScheduleAppointmentController,
  ScheduleAppointmentHandler,
  ScheduleAppointmentService,
} from './schedule-appointment';
import { SchedulePerformer, SchedulePerformerHandler, SchedulePerformerService } from './schedule-performer';
import { ScheduleReportingController, ScheduleReportingService } from './schedule-reporting';

@Module({
  imports: [
    TypeOrmModule.forFeature([Schedule, ScheduleTimeInterval, SchedulePerformer, ScheduleAppointment]),
    IAMModule,
    forwardRef(() => CrmModule),
    forwardRef(() => InventoryModule),
    EntityInfoModule,
  ],
  controllers: [ScheduleController, ScheduleAppointmentController, ScheduleReportingController],
  providers: [
    ScheduleService,
    ScheduleTimeIntervalService,
    SchedulePerformerService,
    SchedulePerformerHandler,
    ScheduleAppointmentService,
    ScheduleAppointmentHandler,
    ScheduleReportingService,
  ],
  exports: [ScheduleService, ScheduleAppointmentService],
})
export class SchedulerModule {}
