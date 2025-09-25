import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';

import { IamEventType, UserDeletedEvent } from '@/modules/iam/common';

import { MailboxState } from '../../common';
import { MailboxService } from './mailbox.service';
import { MailboxEntitySettingsService } from './mailbox-entity-settings.service';

@Injectable()
export class MailboxHandler {
  private readonly logger = new Logger(MailboxHandler.name);
  constructor(
    private readonly mailboxService: MailboxService,
    private readonly mailboxEntitySettingsService: MailboxEntitySettingsService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async synchronizeActive() {
    if (process.env.SCHEDULE_MAIL_ACTIVE_DISABLE === 'true') return;
    this.logger.log('Before: Synchronize active mailboxes');
    const count = await this.mailboxService.synchronize(MailboxState.Active);
    this.logger.log(`After: Synchronize active mailboxes. Processed: ${count}`);
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async synchronizeInactive() {
    if (process.env.SCHEDULE_MAIL_INACTIVE_DISABLE === 'true') return;
    this.logger.log('Before: Synchronize inactive mailboxes');
    const count = await this.mailboxService.synchronize(MailboxState.Inactive);
    this.logger.log(`After: Synchronize inactive mailboxes. Processed: ${count}`);
  }

  @OnEvent(IamEventType.UserDeleted, { async: true })
  async onUserDeleted(event: UserDeletedEvent) {
    await this.mailboxEntitySettingsService.updateUser({
      accountId: event.accountId,
      userId: event.userId,
      newUserId: event.newUserId,
    });
  }
}
