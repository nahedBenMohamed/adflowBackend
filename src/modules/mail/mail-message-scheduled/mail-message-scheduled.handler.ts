import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ActionEmailSendSettings, AutomationJob, EntityTypeActionType, OnAutomationJob } from '@/modules/automation';
import { MailboxEvent, MailEventType } from '@/Mailing/common';

import { MailMessageScheduledService } from './mail-message-scheduled.service';

interface EntityVariables {
  id?: number | null;
  stageId?: number | null;
}

interface SendEmailVariables {
  accountId?: number | null;
  entity?: EntityVariables | null;
  emailSettings?: ActionEmailSendSettings | null;
}

@Injectable()
export class MailMessageScheduledHandler {
  private readonly logger = new Logger(MailMessageScheduledHandler.name);
  constructor(private readonly service: MailMessageScheduledService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async sendScheduledMessages() {
    if (process.env.SCHEDULE_MAIL_SCHEDULED_DISABLE === 'true') return;
    this.logger.log('Before: Sending scheduled messages');
    const processed = await this.service.processMessages();
    this.logger.log(`After: Sending scheduled messages. Processed: ${processed}`);
  }

  @OnEvent(MailEventType.MailboxDeleted, { async: true })
  async onMailboxDeleted(event: MailboxEvent) {
    this.service.delete({ accountId: event.accountId, mailboxId: event.mailboxId, isSent: false });
  }

  /**
   * @deprecated use new @see handleSendEmailJob instead
   */
  @OnAutomationJob(EntityTypeActionType.SendEmail)
  async handleSendEmailJobOld(job: AutomationJob<SendEmailVariables>): Promise<{ variables?: unknown }> {
    return this.handleSendEmailJob(job);
  }
  @OnAutomationJob(EntityTypeActionType.EmailSend)
  async handleSendEmailJob(job: AutomationJob<SendEmailVariables>): Promise<{ variables?: unknown }> {
    if (!job.variables?.accountId || !job.variables?.entity || !job.variables?.emailSettings) {
      this.logger.warn(`Automation job variables are not valid`, job.variables);
      return { variables: job.variables };
    }

    try {
      const { accountId, entity, emailSettings } = job.variables;

      const messages = await this.service.processAutomation({
        accountId,
        entityId: entity.id,
        entityStageId: entity.stageId,
        settings: emailSettings,
      });

      return { variables: { ...job.variables, messages: messages?.map((message) => message.toDto()) } };
    } catch (e) {
      this.logger.error(`Automation job error`, (e as Error)?.stack);
      return { variables: job.variables };
    }
  }
}
