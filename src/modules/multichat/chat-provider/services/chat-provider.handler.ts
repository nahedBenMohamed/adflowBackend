import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';

import { ApplicationConfig } from '@/config';

import { AccountCreatedEvent, IamEventType, UserDeletedEvent } from '@/modules/iam/common';

import { ChatProviderDefaults } from '../const';
import { ChatProviderService } from './chat-provider.service';
import { ChatProviderEntitySettingsService } from './chat-provider-entity-settings.service';

@Injectable()
export class ChatProviderHandler {
  private _appName: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly chatProviderService: ChatProviderService,
    private readonly chatProviderEntitySettingsService: ChatProviderEntitySettingsService,
  ) {
    this._appName = this.configService.get<ApplicationConfig>('application').name;
  }

  @OnEvent(IamEventType.AccountCreated, { async: true })
  async handleAccountCreatedEvent(event: AccountCreatedEvent) {
    await this.chatProviderService.create(event.accountId, event.ownerId, {
      type: ChatProviderDefaults.type,
      transport: ChatProviderDefaults.transport,
      title: this._appName,
      status: ChatProviderDefaults.status,
      messagePerDay: ChatProviderDefaults.messagePerDay,
    });
  }

  @OnEvent(IamEventType.UserDeleted, { async: true })
  async onUserDeleted(event: UserDeletedEvent) {
    await this.chatProviderEntitySettingsService.updateUser({
      accountId: event.accountId,
      userId: event.userId,
      newUserId: event.newUserId,
    });
  }
}
