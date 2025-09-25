import { Module } from '@nestjs/common';

import { ImapflowModule } from './imapflow';

@Module({
  imports: [ImapflowModule],
})
export class MailProvidersModule {}
