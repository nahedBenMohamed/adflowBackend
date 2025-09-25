/* eslint-disable max-len */
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

import { IAMModule } from '@/modules/iam/iam.module';
import { StorageModule } from '@/modules/storage/storage.module';
import { EntityInfoModule } from '@/modules/entity/entity-info/entity-info.module';
import { CrmModule } from '@/CRM/crm.module';

import mailConfig, { MailConfig } from './config/mail.config';

import { MailMessageBuilderService } from './mail-message-builder';
import { MailMessagePayload, MailMessagePayloadService } from './mail-message-payload';
import { Mailbox, MailboxAccessibleUser, MailboxEntitySettings } from './mailbox/entities';
import {
  MailboxAccessibleUserService,
  MailboxEntitySettingsService,
  MailboxHandler,
  MailboxLockService,
  MailboxService as MailboxSettingsService,
} from './mailbox/services';
import { MailboxController } from './mailbox/mailbox.controller';
import { MailboxFolder, MailboxFolderService } from './mailbox-folder';
import {
  MailboxSignature,
  MailboxSignatureController,
  MailboxSignatureMailbox,
  MailboxSignatureService,
} from './mailbox-signature';
import { MailProviderRegistry } from './mail-provider';
import { UnsubscribeController } from './subscription';
import { PublicSystemMailingController, SystemMailingController, SystemMailingService } from './system-mailing';

import { MailboxSettingsManual } from './Model/MailboxManual/MailboxSettingsManual';
import { MailboxSettingsGmail } from './Model/MailboxGmail/MailboxSettingsGmail';
import { MailMessage } from './Model/MailMessage/MailMessage';
import { MailMessageFolder } from './Model/MailMessage/MailMessageFolder';

import { MailboxService } from './Service/Mailbox/MailboxService';
import { MailboxManualService } from './Service/MailboxManual/MailboxManualService';
import { MailboxGmailService } from './Service/MailboxGmail/MailboxGmailService';
import { MailMessageService } from './Service/MailMessage/MailMessageService';

import { GetMailboxSettingsManualController } from './Controller/MailboxManual/GetMailboxSettingsManualController';
import { UpdateMailboxSettingsManualController } from './Controller/MailboxManual/UpdateMailboxSettingsManualController';
import { GmailAuthConnectController } from './Controller/MailboxGmail/GmailAuthConnectController';
import { GmailAuthCallbackController } from './Controller/MailboxGmail/GmailAuthCallbackController';
import { GetAttachmentController } from './Controller/MailMessage/GetAttachmentController';
import { GetMailboxesInfoController } from './Controller/Mailbox/GetMailboxesInfoController';
import { GetSectionMessagesController } from './Controller/MailMessage/GetSectionMessagesController';
import { GetMailboxMessagesController } from './Controller/MailMessage/GetMailboxMessagesController';
import { GetMailMessageController } from './Controller/MailMessage/GetMailMessageController';
import { GetMailThreadController } from './Controller/MailMessage/GetMailThreadController';
import { SendMailMessageController } from './Controller/Mailbox/SendMailMessageController';
import { TrashMailThreadController } from './Controller/Mailbox/TrashMailThreadController';
import { UntrashMailThreadController } from './Controller/Mailbox/UntrashMailThreadController';
import { SpamMailThreadController } from './Controller/Mailbox/SpamMailThreadController';
import { UnspamMailThreadController } from './Controller/Mailbox/UnspamMailThreadController';
import { SeenMailThreadController } from './Controller/Mailbox/SeenMailThreadController';
import { UnseenMailThreadController } from './Controller/Mailbox/UnseenMailThreadController';
import { CreateContactAndLeadController } from './Controller/MailMessage/CreateContactAndLeadController';

@Module({
  imports: [
    ConfigModule.forFeature(mailConfig),
    DiscoveryModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<MailConfig>('mail');
        return {
          transport: {
            host: config.mailing.host,
            port: config.mailing.port,
            secure: config.mailing.secure,
            auth: {
              user: config.mailing.user,
              pass: config.mailing.password,
            },
          },
          defaults: {
            from: config.mailing.from,
            replyTo: config.mailing.replyTo,
          },
          template: {
            dir: join(__dirname, './system-mailing/templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
    TypeOrmModule.forFeature([
      Mailbox,
      MailboxAccessibleUser,
      MailboxEntitySettings,
      MailboxSettingsManual,
      MailboxSettingsGmail,
      MailboxFolder,
      MailMessage,
      MailMessagePayload,
      MailMessageFolder,
      MailboxSignature,
      MailboxSignatureMailbox,
    ]),
    IAMModule,
    StorageModule,
    forwardRef(() => CrmModule),
    EntityInfoModule,
  ],
  providers: [
    MailboxSettingsService,
    MailboxHandler,
    MailboxLockService,
    MailboxAccessibleUserService,
    MailboxEntitySettingsService,
    SystemMailingService,
    MailboxService,
    MailboxManualService,
    MailboxGmailService,
    MailboxFolderService,
    MailMessageService,
    MailMessagePayloadService,
    MailMessageBuilderService,
    MailboxSignatureService,
    MailProviderRegistry,
  ],
  controllers: [
    MailboxController,
    SystemMailingController,
    PublicSystemMailingController,
    GetMailboxSettingsManualController,
    UpdateMailboxSettingsManualController,
    GmailAuthConnectController,
    GmailAuthCallbackController,
    GetAttachmentController,
    GetMailboxesInfoController,
    GetSectionMessagesController,
    GetMailboxMessagesController,
    GetMailMessageController,
    GetMailThreadController,
    SendMailMessageController,
    TrashMailThreadController,
    UntrashMailThreadController,
    SpamMailThreadController,
    UnspamMailThreadController,
    SeenMailThreadController,
    UnseenMailThreadController,
    CreateContactAndLeadController,
    MailboxSignatureController,
    UnsubscribeController,
  ],
  exports: [
    SystemMailingService,
    MailMessageService,
    MailboxService,
    MailboxSettingsService,
    MailboxFolderService,
    MailMessageBuilderService,
  ],
})
export class MailingModule {}
