import { Injectable, Logger } from '@nestjs/common';

import {
  ActionChatSendAmworkSettings,
  AutomationJob,
  EntityTypeActionType,
  OnAutomationJob,
} from '@/modules/automation';

import { ChatService } from './chat.service';

interface EntityVariables {
  id?: number | null;
  stageId?: number | null;
}

interface SendChatVariables {
  accountId: number;
  entity?: EntityVariables | null;
  chatSettings?: ActionChatSendAmworkSettings | null;
}

@Injectable()
export class ChatHandler {
  private readonly logger = new Logger(ChatHandler.name);
  constructor(private readonly service: ChatService) {}

  @OnAutomationJob(EntityTypeActionType.ChatSendAmwork)
  async handleSendMessageJob(job: AutomationJob<SendChatVariables>): Promise<{ variables?: unknown }> {
    if (!job.variables?.accountId || !job.variables?.entity || !job.variables?.chatSettings) {
      this.logger.warn(`Automation job variables are not valid`, job.variables);
      return { variables: job.variables };
    }

    try {
      const { accountId, entity, chatSettings } = job.variables;

      const chat = await this.service.processAutomation({
        accountId,
        entityId: entity.id,
        entityStageId: entity.stageId,
        settings: chatSettings,
      });

      return { variables: { ...job.variables, chat: chat?.toDto() } };
    } catch (e) {
      this.logger.error(`Automation job error`, (e as Error)?.stack);
      return { variables: job.variables };
    }
  }
}
