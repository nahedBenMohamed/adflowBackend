import { HttpService } from '@nestjs/axios';
import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import { splitByFirstSpace, TaskQueue, UrlGeneratorService } from '@/common';
import { ApplicationConfig } from '@/config';
import { Account } from '@/modules/iam/account/entities/account.entity';
import { AccountService } from '@/modules/iam/account/account.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { StorageService } from '@/modules/storage/storage.service';
import { StorageUrlService } from '@/modules/storage/storage-url.service';

import { MultichatEventType } from '../../common';
import { ChatUser } from '../../chat-user';
import { ChatProvider } from '../../chat-provider/entities';
import { ChatProviderService } from '../../chat-provider/services/chat-provider.service';
import { Chat } from '../../chat/entities/chat.entity';
import { ChatService } from '../../chat/services/chat.service';
import { ChatMessage } from '../../chat-message/entities/chat-message.entity';
import { ChatMessageService } from '../../chat-message/services/chat-message.service';

import { WazzupConfig } from './config';
import { CreateWazzupProviderDto, UpdateWazzupProviderDto } from './dto';
import { ChatProviderWazzup } from './entities';
import {
  WazzupChannel,
  WazzupConnectRequest,
  WazzupMessage,
  WazzupSendMessage,
  WazzupSendMessageResponse,
  WazzupWebhookRequest,
} from './types';
import { WazzupChatType, WazzupMessageStatus, WazzupTransport } from './enums';

const WazzupUrls = {
  wazzup: 'https://api.wazzup24.com/v3',
  webhooks: () => `${WazzupUrls.wazzup}/webhooks`,
  channels: () => `${WazzupUrls.wazzup}/channels`,
  message: () => `${WazzupUrls.wazzup}/message`,
  connect: () => `${WazzupUrls.wazzup}/connect`,
} as const;

const WEBHOOK_PATH = '/api/chat/wazzup/webhook';

const chatTypeMap: Record<WazzupTransport, WazzupChatType> = {
  [WazzupTransport.Avito]: WazzupChatType.Avito,
  [WazzupTransport.Instagram]: WazzupChatType.Instagram,
  [WazzupTransport.Telegram]: WazzupChatType.Telegram,
  [WazzupTransport.Tgapi]: WazzupChatType.Telegram,
  [WazzupTransport.Vk]: WazzupChatType.Vk,
  [WazzupTransport.Wapi]: WazzupChatType.Whatsapp,
  [WazzupTransport.Whatsapp]: WazzupChatType.Whatsapp,
};

const tgapiDirectPrefix = 'tgd_';

@Injectable()
export class WazzupProviderService {
  private readonly logger = new Logger(WazzupProviderService.name);
  private config: WazzupConfig;
  private _appName: string;
  private readonly queue = new TaskQueue();

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(ChatProviderWazzup)
    private readonly repository: Repository<ChatProviderWazzup>,
    private readonly urlGenerator: UrlGeneratorService,
    private readonly accountService: AccountService,
    private readonly storageService: StorageService,
    private readonly storageUrlService: StorageUrlService,
    private readonly chatProviderService: ChatProviderService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    @Inject(forwardRef(() => ChatMessageService))
    private readonly chatMessageService: ChatMessageService,
  ) {
    this.config = this.configService.get<WazzupConfig>('wazzup');
    this._appName = this.configService.get<ApplicationConfig>('application').name;
  }

  async getApiKey(account: Account, state: string): Promise<string | null> {
    try {
      const response$ = this.httpService
        .post(
          WazzupUrls.connect(),
          new WazzupConnectRequest({
            state,
            secret: this.config.secret,
            crmKey: account.subdomain,
            name: `${this._appName}-${account.subdomain}`,
          }),
        )
        .pipe(
          catchError((error) => {
            this.logger.error(`WAuth connect error`, (error as Error)?.stack);
            throw error;
          }),
        );
      const response = await lastValueFrom(response$);
      return response.data.data as string;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return null;
    }
  }

  async findChannels(accountId: number, apiKey: string): Promise<WazzupChannel[]> {
    try {
      const response$ = this.httpService
        .get(WazzupUrls.channels(), { headers: { Authorization: `Bearer ${apiKey}` } })
        .pipe(
          catchError((error) => {
            this.logger.error(`Get channels error for accountId=${accountId}`, (error as Error)?.stack);
            throw error;
          }),
        );
      const response = await lastValueFrom(response$);
      return response.data as WazzupChannel[];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return [];
    }
  }

  async create(account: Account, userId: number, dto: CreateWazzupProviderDto): Promise<ChatProviderWazzup> {
    if (!(await this.setWebhook(account, dto.apiKey))) {
      throw new Error('Webhook not connected');
    }

    const provider = await this.chatProviderService.create(account.id, userId, dto);

    const wazzupProvider = await this.repository.save(ChatProviderWazzup.fromDto(account.id, provider.id, dto));
    wazzupProvider.provider = provider;

    return wazzupProvider;
  }

  async findMany(accountId: number, user: User): Promise<ChatProviderWazzup[]> {
    const allProviders = await this.repository
      .createQueryBuilder('wp')
      .where('wp.account_id = :accountId', { accountId })
      .getMany();

    for (const provider of allProviders) {
      provider.provider = await this.chatProviderService.findOne(
        accountId,
        null,
        { providerId: provider.providerId },
        { expand: ['accessibleUsers', 'responsibleUsers', 'supervisorUsers', 'entitySettings'] },
      );
    }

    return user.isAdmin
      ? allProviders
      : allProviders.filter(
          (p) =>
            !p.provider.accessibleUsers ||
            p.provider.accessibleUsers.length === 0 ||
            p.provider.accessibleUsers.some((u) => u.userId === user.id),
        );
  }

  async findOne(accountId: number, providerId: number): Promise<ChatProviderWazzup> {
    const provider = await this.chatProviderService.findOne(
      accountId,
      null,
      { providerId },
      { expand: ['accessibleUsers', 'responsibleUsers', 'supervisorUsers', 'entitySettings'] },
    );

    const wazzupProvider = await this.repository.findOneBy({ accountId, providerId });
    wazzupProvider.provider = provider;

    return wazzupProvider;
  }

  async update(accountId: number, providerId: number, dto: UpdateWazzupProviderDto): Promise<ChatProviderWazzup> {
    const provider = await this.chatProviderService.update(accountId, null, providerId, dto);

    const wazzupProvider = await this.repository.findOneBy({ accountId, providerId });

    wazzupProvider.provider = provider;

    return wazzupProvider;
  }

  async delete({ accountId, userId, providerId }: { accountId: number; userId: number; providerId: number }) {
    await this.repository.delete({ accountId, providerId });
    await this.chatProviderService.delete({ accountId, userId, providerId });
  }

  async handleWebhook(body: unknown): Promise<string> {
    const request = body as WazzupWebhookRequest;
    if (request.test) {
      //webhook test
    }

    if (request.messages) {
      for (const message of request.messages) {
        if (message.status === WazzupMessageStatus.Inbound) {
          const wazzupProvider = await this.repository.findOneBy({ channelId: message.channelId });
          if (wazzupProvider) {
            const account = await this.accountService.findOne({ accountId: wazzupProvider.accountId });
            if (this.config.enqueue) {
              this.queue.enqueue(() => this.handleMessage({ account, providerId: wazzupProvider.providerId, message }));
            } else {
              await this.handleMessage({ account, providerId: wazzupProvider.providerId, message });
            }
          }
        }
      }
    }

    return 'ok';
  }

  private async handleMessage({
    account,
    providerId,
    message,
  }: {
    account: Account;
    providerId: number;
    message: WazzupMessage;
  }) {
    this.logger.debug(`Handle message: ${JSON.stringify(message)}`);
    try {
      const chatUser = await this.getChatUser({ accountId: account.id, providerId, message });
      if (chatUser) {
        const fileIds = await this.getMessageFileIds(account.id, message.contentUri);
        await this.chatMessageService.createExternal(account, chatUser, message.text ?? '', message.messageId, fileIds);
      }
    } catch (error) {
      this.logger.error(`Handle message error`, (error as Error)?.stack);
    }
  }

  private async getChatUser({
    accountId,
    providerId,
    message,
  }: {
    accountId: number;
    providerId: number;
    message: WazzupMessage;
  }): Promise<ChatUser | null> {
    const userExternalId = (
      message.contact?.username ||
      message.contact?.phone ||
      message.avitoProfileId ||
      message.authorName ||
      ''
    ).trim();
    const userName = (message.contact.name || message.contact.username || message.authorName || '').trim();
    const [firstName, lastName] = splitByFirstSpace(userName);

    return this.chatProviderService.getChatUserExternal({
      accountId,
      providerId,
      chatExternalId: this.formatChatExternalId(message),
      externalUserDto: {
        externalId: userExternalId,
        firstName,
        lastName,
        avatarUrl: message.contact.avatarUri,
        phone: message.contact.phone,
      },
    });
  }

  async notifyChatUsers(
    account: Account,
    provider: ChatProvider,
    chat: Chat,
    type: MultichatEventType,
    message: ChatMessage,
    users: ChatUser[],
  ): Promise<void> {
    const wazzupProvider = await this.repository.findOneBy({ accountId: account.id, providerId: provider.id });
    wazzupProvider.provider = provider;

    switch (type) {
      case MultichatEventType.ChatMessageCreated:
        this.sendMessage(account, wazzupProvider, chat, message, users);
        break;
    }
  }

  async createChatExternalId(accountId: number, providerId: number, userExternalId: string): Promise<string | null> {
    const provider = await this.repository.findOneBy({ accountId, providerId });
    const chatId = this.formatChatId({ provider, userExternalId });
    return this.formatChatExternalId({ chatType: chatTypeMap[provider.transport], chatId });
  }

  private async setWebhook(account: Account, apiKey: string): Promise<boolean> {
    const webhooksUri = this.urlGenerator.createUrl({ route: WEBHOOK_PATH, subdomain: account.subdomain });
    try {
      const response$ = this.httpService.patch(
        WazzupUrls.webhooks(),
        { webhooksUri, subscriptions: { messagesAndStatuses: true } },
        { headers: { Authorization: `Bearer ${apiKey}` } },
      );
      const response = await lastValueFrom(response$);
      return !!response.data;
    } catch (e) {
      this.logger.error(`Connect webhook error`, (e as Error)?.stack);
      return false;
    }
  }

  private async sendMessage(
    account: Account,
    provider: ChatProviderWazzup,
    chat: Chat,
    message: ChatMessage,
    users: ChatUser[],
  ): Promise<void> {
    const fileUrls =
      message.files && message.files.length > 0
        ? message.files.map((file) => this.storageUrlService.getTemporaryUrl(file.fileId, account.subdomain))
        : [];

    for (const user of users) {
      if (user.externalUser) {
        const { chatType, chatId, tgPhone } = this.parseChatExternalId(chat.externalId);

        if (message.text) {
          try {
            const response$ = this.httpService.post(
              WazzupUrls.message(),
              new WazzupSendMessage({
                channelId: provider.channelId,
                chatType,
                chatId,
                phone: tgPhone,
                text: message.text,
              }),
              { headers: { Authorization: `Bearer ${provider.apiKey}` } },
            );
            const response = await lastValueFrom(response$);
            const data = response.data as WazzupSendMessageResponse;
            if (tgPhone && data?.chatId) {
              const externalId = this.formatChatExternalId({ chatType, chatId: data.chatId });
              const existingChat = await this.chatService.findOne({
                accountId: account.id,
                filter: { providerId: provider.providerId, externalId },
              });
              if (existingChat) {
                await this.chatService.mergeChat(account, chat.id, existingChat.id);
              } else {
                await this.chatService.updateExternalId(account.id, chat.id, { externalId });
              }
            }
          } catch (e) {
            this.logger.error(`Send message error`, (e as Error)?.stack);
          }
        }

        for (const fileUrl of fileUrls) {
          try {
            const response$ = this.httpService.post(
              WazzupUrls.message(),
              new WazzupSendMessage({ channelId: provider.channelId, chatType, chatId, contentUri: fileUrl }),
              { headers: { Authorization: `Bearer ${provider.apiKey}` } },
            );
            await lastValueFrom(response$);
          } catch (e) {
            this.logger.error(`Send file error`, (e as Error)?.stack);
          }
        }
      }
    }
  }

  async sendDirectMessage({
    accountId,
    providerId,
    phone,
    message,
  }: {
    accountId: number;
    providerId: number;
    phone: string;
    message: string;
  }): Promise<void> {
    this.logger.debug(`sendDirectMessage: ${JSON.stringify({ accountId, providerId, phone, message })}`);
    const provider = await this.repository.findOneBy({ accountId, providerId });
    const phoneNumber = phone.startsWith('+') ? phone.slice(1) : phone;
    const wazzupMessage = new WazzupSendMessage({
      channelId: provider.channelId,
      chatType: chatTypeMap[provider.transport],
      phone: phoneNumber,
      text: message,
    });
    this.logger.debug(`sendDirectMessage wazzupMessage: ${JSON.stringify(wazzupMessage)}`);
    try {
      const { data } = await lastValueFrom(
        this.httpService.post(WazzupUrls.message(), wazzupMessage, {
          headers: { Authorization: `Bearer ${provider.apiKey}` },
        }),
      );
      this.logger.debug(`sendDirectMessage response data: ${JSON.stringify(data)}`);
    } catch (e) {
      this.logger.error(`Send message error`, (e as Error)?.stack);
    }
  }

  private async getMessageFileIds(accountId: number, contentUri: string | null): Promise<string[] | null> {
    if (!contentUri) {
      return null;
    }

    const fileInfo = await this.storageService.storeExternalFile(accountId, null, contentUri);
    return fileInfo ? [fileInfo.id] : [];
  }

  private formatChatId({ provider, userExternalId }: { provider: ChatProviderWazzup; userExternalId: string }) {
    const externalId = userExternalId.startsWith('+') ? userExternalId.slice(1) : userExternalId;
    return provider.transport === WazzupTransport.Tgapi ? `${tgapiDirectPrefix}${externalId}` : externalId;
  }

  private formatChatExternalId({ chatType, chatId }: { chatType: WazzupChatType; chatId: string }): string {
    return `${chatType}|${chatId}`;
  }
  private parseChatExternalId(externalId: string): {
    chatType: WazzupChatType;
    chatId: string | undefined;
    tgPhone: string | undefined;
  } {
    const index = externalId.indexOf('|');
    const chatType = externalId.substring(0, index);
    const rest = externalId.substring(index + 1);

    const tgPhone = rest.startsWith(tgapiDirectPrefix) ? rest.slice(tgapiDirectPrefix.length) : undefined;
    const chatId = rest.startsWith(tgapiDirectPrefix) ? undefined : rest;

    return { chatType: chatType as WazzupChatType, chatId, tgPhone };
  }
}
