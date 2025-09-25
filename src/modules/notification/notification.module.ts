import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { EntityInfoModule } from '@/modules/entity/entity-info/entity-info.module';
import { CrmModule } from '@/CRM/crm.module';

import { Notification } from './notification/entities/notification.entity';
import { NotificationService } from './notification/notification.service';
import { NotificationEventHandler } from './notification/notification-event.handler';
import { NotificationScheduler } from './notification/notification-scheduler';
import { NotificationController } from './notification/notification.controller';

import { NotificationSettings } from './notification-settings/entities/notification-settings.entity';
import { NotificationTypeSettings } from './notification-settings/entities/notification-type-settings.entity';
import { NotificationTypeFollowUser } from './notification-settings/entities/notification-type-follow-user.entity';
import { NotificationSettingsService } from './notification-settings/notification-settings.service';
import { NotificationSettingsController } from './notification-settings/notification-settings.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Notification,
      NotificationSettings,
      NotificationTypeSettings,
      NotificationTypeFollowUser,
    ]),
    IAMModule,
    CrmModule,
    EntityInfoModule,
  ],
  providers: [NotificationService, NotificationScheduler, NotificationEventHandler, NotificationSettingsService],
  controllers: [NotificationController, NotificationSettingsController],
})
export class NotificationModule {}
