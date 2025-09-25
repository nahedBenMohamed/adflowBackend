import { Module } from '@nestjs/common';

import { MailMessageScheduledModule } from './mail-message-scheduled';
import { MailProvidersModule } from './mail-providers';

@Module({
  imports: [MailMessageScheduledModule, MailProvidersModule],
})
export class MailModule {}
