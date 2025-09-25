import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { DocumentsModule } from '@/modules/documents/documents.module';
import { CrmModule } from '@/CRM/crm.module';
import { MailingModule } from '@/Mailing/MailingModule';

import { MailMessageScheduled } from './entities';
import { MailMessageScheduledService } from './mail-message-scheduled.service';
import { MailMessageScheduledController } from './mail-message-scheduled.controller';
import { MailMessageScheduledHandler } from './mail-message-scheduled.handler';

@Module({
  imports: [TypeOrmModule.forFeature([MailMessageScheduled]), IAMModule, MailingModule, CrmModule, DocumentsModule],
  providers: [MailMessageScheduledService, MailMessageScheduledHandler],
  controllers: [MailMessageScheduledController],
})
export class MailMessageScheduledModule {}
