import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { ConditionalModule, ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

import applicationConfig from './config/application.config';

import { ApiDocumentation } from './documentation';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { SupportModule } from './support/support.module';
import { IAMModule } from './modules/iam/iam.module';
import { FrontendEventModule } from './modules/frontend-event/frontend-event.module';
import { StorageModule } from './modules/storage/storage.module';
import { NotificationModule } from './modules/notification/notification.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { MultichatModule } from './modules/multichat/multichat.module';
import { TelephonyModule } from './modules/telephony/telephony.module';
import { FormsModule } from './modules/forms/forms.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { EntityModule } from './modules/entity/entity.module';
import { TutorialModule } from './modules/tutorial/tutorial.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { DataEnrichmentModule } from './modules/data-enrichment/data-enrichment.module';
import { SetupModule } from './modules/setup/setup.module';
import { PartnerModule } from './modules/partner/partner.module';
import { AutomationModule } from './modules/automation/automation.module';
import { IntegrationModule } from './modules/integration/integration.module';
import { MailModule } from './modules/mail/mail.module';
import { FrontendObjectModule } from './modules/frontend-object/frontend-object.module';

import { CrmModule } from './CRM/crm.module';
import { MailingModule } from './Mailing/MailingModule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: ['.env.local', '.env'],
      load: [applicationConfig],
    }),
    ConditionalModule.registerWhen(ScheduleModule.forRoot(), 'SCHEDULE_ENABLED'),
    EventEmitterModule.forRoot({ delimiter: ':', maxListeners: 100, wildcard: true }),
    ApiDocumentation,
    DatabaseModule,
    CommonModule,
    IAMModule,
    FrontendEventModule,
    StorageModule,
    NotificationModule,
    MailingModule,
    MultichatModule,
    EntityModule,
    CrmModule,
    InventoryModule,
    SchedulerModule,
    TelephonyModule,
    FormsModule,
    AnalyticsModule,
    TutorialModule,
    DocumentsModule,
    DataEnrichmentModule,
    SetupModule,
    PartnerModule,
    ConditionalModule.registerWhen(AutomationModule, 'AUTOMATION_ENABLED'),
    IntegrationModule,
    SupportModule,
    MailModule,
    FrontendObjectModule,
    RouterModule.register([
      { path: 'automation', module: AutomationModule },
      { path: 'iam', module: IAMModule },
      { path: 'site-forms', module: FormsModule },
      { path: 'scheduler', module: SchedulerModule },
      { path: 'telephony', module: TelephonyModule },
      { path: 'tutorial', module: TutorialModule },
    ]),
  ],
})
export class AppModule {}
