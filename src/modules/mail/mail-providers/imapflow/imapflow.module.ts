import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IAMModule } from '@/modules/iam/iam.module';
import { MailingModule } from '@/Mailing/MailingModule';

import imapflowConfig from './config/imapflow.config';
import { MailboxSettingsImapflow } from './entities';
import { ImapflowService } from './imapflow.service';
import { ImapflowController } from './imapflow.controller';

@Module({
  imports: [
    ConfigModule.forFeature(imapflowConfig),
    TypeOrmModule.forFeature([MailboxSettingsImapflow]),
    IAMModule,
    MailingModule,
  ],
  providers: [ImapflowService],
  controllers: [ImapflowController],
})
export class ImapflowModule {}
