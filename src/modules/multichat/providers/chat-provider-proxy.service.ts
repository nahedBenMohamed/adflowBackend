import { Injectable } from '@nestjs/common';

import { Account } from '@/modules/iam/account/entities/account.entity';

import { ChatProviderType, MultichatEventType } from '../common';
import { ChatUser } from '../chat-user';
import { ChatProvider } from '../chat-provider/entities';
import { ChatProviderService } from '../chat-provider/services/chat-provider.service';
import { Chat } from '../chat/entities/chat.entity';
import { ChatMessage } from '../chat-message/entities/chat-message.entity';

import { MessengerProviderService } from './facebook/messenger-provider.service';
import { TwilioProviderService } from './twilio/twilio-provider.service';
import { WazzupProviderService } from './wazzup/wazzup-provider.service';

@Injectable()
export class ChatProviderProxyService {
  constructor(
    private readonly chatProviderService: ChatProviderService,
    private readonly twilioService: TwilioProviderService,
    private readonly messengerService: MessengerProviderService,
    private readonly wazzupService: WazzupProviderService,
  ) {}

  async createChatExternalId(accountId: number, providerId: number, userExternalId: string): Promise<string | null> {
    const provider = await this.chatProviderService.findOne(accountId, null, { providerId });
    switch (provider?.type) {
      case ChatProviderType.Amwork:
        return null;
      case ChatProviderType.Facebook:
        return this.messengerService.createChatExternalId(userExternalId);
      case ChatProviderType.Twilio:
        return this.twilioService.createChatExternalId(userExternalId);
      case ChatProviderType.Wazzup:
        return this.wazzupService.createChatExternalId(accountId, providerId, userExternalId);
    }
  }

  async notifyChatUsers(
    account: Account,
    provider: ChatProvider,
    chat: Chat,
    type: MultichatEventType,
    message: ChatMessage,
    users: ChatUser[],
  ): Promise<void> {
    switch (provider.type) {
      case ChatProviderType.Facebook:
        await this.messengerService.notifyChatUsers(account, message, type, provider, users);
        break;
      case ChatProviderType.Twilio:
        await this.twilioService.notifyChatUsers(account, message, type, provider, users);
        break;
      case ChatProviderType.Wazzup:
        await this.wazzupService.notifyChatUsers(account, provider, chat, type, message, users);
        break;
    }
  }

  async sendDirectMessage({
    accountId,
    provider,
    phone,
    message,
  }: {
    accountId: number;
    provider: ChatProvider;
    phone: string;
    message: string;
  }): Promise<void> {
    switch (provider?.type) {
      case ChatProviderType.Twilio:
        return this.twilioService.sendDirectMessage({ accountId, providerId: provider.id, phone, message });
      case ChatProviderType.Wazzup:
        return this.wazzupService.sendDirectMessage({ accountId, providerId: provider.id, phone, message });
    }
  }
}
