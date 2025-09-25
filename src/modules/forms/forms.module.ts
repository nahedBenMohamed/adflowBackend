import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { SchedulerModule } from '@/modules/scheduler/scheduler.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { CrmModule } from '@/CRM/crm.module';

import { SiteFormField, SiteFormFieldController, SiteFormFieldService } from './site-form-field';
import { SiteFormPage, SiteFormPageController, SiteFormPageService } from './site-form-page';
import { SiteFormConsent, SiteFormConsentController, SiteFormConsentService } from './site-form-consent';
import { SiteFormGratitude, SiteFormGratitudeController, SiteFormGratitudeService } from './site-form-gratitude';
import {
  SiteForm,
  SiteFormController,
  SiteFormEntityType,
  SiteFormEntityTypeService,
  SiteFormSchedule,
  SiteFormScheduleService,
  SiteFormService,
} from './site-form';
import { SiteFormBuilderController, SiteFormBuilderService } from './site-form-builder';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SiteForm,
      SiteFormEntityType,
      SiteFormSchedule,
      SiteFormPage,
      SiteFormConsent,
      SiteFormGratitude,
      SiteFormField,
    ]),
    IAMModule,
    StorageModule,
    CrmModule,
    SchedulerModule,
  ],
  providers: [
    SiteFormService,
    SiteFormEntityTypeService,
    SiteFormScheduleService,
    SiteFormConsentService,
    SiteFormGratitudeService,
    SiteFormPageService,
    SiteFormFieldService,
    SiteFormBuilderService,
  ],
  controllers: [
    SiteFormController,
    SiteFormConsentController,
    SiteFormGratitudeController,
    SiteFormPageController,
    SiteFormFieldController,
    SiteFormBuilderController,
  ],
})
export class FormsModule {}
