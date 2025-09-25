import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { CrmModule } from '@/CRM/crm.module';
import { InventoryModule } from '@/modules/inventory/inventory.module';
import { SchedulerModule } from '@/modules/scheduler/scheduler.module';

import { DemoData } from './entities/demo-data.entity';
import { DemoDataController } from './demo-data.controller';
import { DemoDataService } from './demo-data.service';

@Module({
  imports: [TypeOrmModule.forFeature([DemoData]), IAMModule, CrmModule, InventoryModule, SchedulerModule],
  controllers: [DemoDataController],
  providers: [DemoDataService],
  exports: [DemoDataService],
})
export class DemoDataModule {}
