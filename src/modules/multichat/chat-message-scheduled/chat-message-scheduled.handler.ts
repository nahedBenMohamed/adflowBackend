import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ActionChatSendSettings, AutomationJob, EntityTypeActionType, OnAutomationJob } from '@/modules/automation';

import { ChatMessageScheduledService } from './chat-message-scheduled.service';

interface EntityVariables {
  id?: number | null;
  stageId?: number | null;
}

interface SendChatVariables {
  accountId: number;
  entity?: EntityVariables | null;
  chatSettings?: ActionChatSendSettings | null;
}

@Injectable()
export class ChatMessageScheduledHandler {
  private readonly logger = new Logger(ChatMessageScheduledHandler.name);
  constructor(private readonly service: ChatMessageScheduledService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  public async sendScheduledMessages() {
    if (process.env.SCHEDULE_CHAT_SCHEDULED_DISABLE === 'true') return;
    this.logger.log('Before: Sending scheduled messages');
    const processed = await this.service.processMessages();
    this.logger.log(`After: Sending scheduled messages. Processed: ${processed}`);
  }

  @OnAutomationJob(EntityTypeActionType.ChatSendExternal)
  async handleSendMessageJob(job: AutomationJob<SendChatVariables>): Promise<{ variables?: unknown }> {
    if (!job.variables?.accountId || !job.variables?.entity || !job.variables?.chatSettings) {
      this.logger.warn(`Automation job variables are not valid`, job.variables);
      return { variables: job.variables };
    }

    try {
      const { accountId, entity, chatSettings } = job.variables;

      const messages = await this.service.processAutomation({
        accountId,
        entityId: entity.id,
        entityStageId: entity.stageId,
        settings: chatSettings,
      });

      return { variables: { ...job.variables, messages: messages?.map((message) => message.toDto()) } };
    } catch (e) {
      this.logger.error(`Automation job error`, (e as Error)?.stack);
      return { variables: job.variables };
    }
  }
}
