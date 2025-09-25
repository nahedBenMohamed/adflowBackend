import { Mailbox } from '@/Mailing/mailbox/entities';

import { MailboxImapflowDto } from '../dto';
import { MailboxSettingsImapflow } from '../entities';

export class MailboxImapflow {
  private readonly mailbox: Mailbox;
  private readonly settings: MailboxSettingsImapflow;

  constructor({ mailbox, settings }: { mailbox: Mailbox; settings: MailboxSettingsImapflow }) {
    this.mailbox = mailbox;
    this.settings = settings;
  }

  toDto(): MailboxImapflowDto {
    return {
      ...this.mailbox.toDto(),
      settings: this.settings.toDto(),
    };
  }
}
