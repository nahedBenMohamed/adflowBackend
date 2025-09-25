import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { IAMModule } from '@/modules/iam/iam.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { InventoryModule } from '@/modules/inventory/inventory.module';
import { SchedulerModule } from '@/modules/scheduler/scheduler.module';
import { EntityFieldModule } from '@/modules/entity/entity-field/entity-field.module';
import { IntegrationModule } from '@/modules/integration/integration.module';
import { PartnerModule } from '@/modules/partner/partner.module';

import { CrmModule } from '@/CRM/crm.module';
import { TaskSettingsModule } from '@/CRM/task-settings/task-settings.module';

import accountSetupConfig from './config/account-setup.config';

import { RmsModule } from '../rms/rms.module';
import { DemoDataModule } from '../demo-data/demo-data.module';

import {
  RmsActivityService,
  RmsBoardService,
  RmsEntityService,
  RmsEntityTypeService,
  RmsFieldService,
  RmsNoteService,
  RmsTaskService,
  SetupCrmService,
  SetupIAMService,
  SetupProductsService,
  SetupSchedulerService,
} from './services';
import { AccountSetupService } from './account-setup.service';
import { PublicAccountSetupController } from './public-account-setup.controller';

@Module({
  imports: [
    ConfigModule.forFeature(accountSetupConfig),
    IAMModule,
    StorageModule,
    CrmModule,
    IntegrationModule,
    InventoryModule,
    SchedulerModule,
    TaskSettingsModule,
    EntityFieldModule,
    RmsModule,
    DemoDataModule,
    PartnerModule,
  ],
  providers: [
    RmsActivityService,
    RmsBoardService,
    RmsEntityService,
    RmsEntityTypeService,
    RmsFieldService,
    RmsNoteService,
    RmsTaskService,
    SetupCrmService,
    SetupIAMService,
    SetupProductsService,
    SetupSchedulerService,
    AccountSetupService,
  ],
  controllers: [PublicAccountSetupController],
})
export class AccountSetupModule {}
