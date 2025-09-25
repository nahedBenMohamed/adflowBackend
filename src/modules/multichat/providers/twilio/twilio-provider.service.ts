import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import TwilioSDK from 'twilio';

import { NotFoundError, splitByFirstSpace } from '@/common';

import { AccountService } from '@/modules/iam/account/account.service';
import { Account } from '@/modules/iam/account/entities/account.entity';
import { User } from '@/modules/iam/user/entities/user.entity';
import { StorageUrlService } from '@/modules/storage/storage-url.service';
import { StorageService } from '@/modules/storage/storage.service';

import { ChatProviderType, MultichatEventType } from '../../common';
import { ChatUser } from '../../chat-user';
import { ChatMessage } from '../../chat-message/entities/chat-message.entity';
import { ChatMessageService } from '../../chat-message/services/chat-message.service';
import { ChatProvider } from '../../chat-provider/entities';
import { ChatProviderService } from '../../chat-provider/services/chat-provider.service';

import { CreateTwilioProviderDto, UpdateTwilioProviderDto } from './dto';
import { ChatProviderTwilio } from './entities';
import { TwilioRequestBody } from './types';

@Injectable()
export class TwilioProviderService {
  private readonly logger = new Logger(TwilioProviderService.name);

  constructor(
    @InjectRepository(ChatProviderTwilio)
    private readonly repository: Repository<ChatProviderTwilio>,
    private readonly accountService: AccountService,
    private readonly storageService: StorageService,
    private readonly storageUrlService: StorageUrlService,
    private readonly chatProviderService: ChatProviderService,
    @Inject(forwardRef(() => ChatMessageService))
    private readonly chatMessageService: ChatMessageService,
  ) {}

  async getProvidersWithSettings(accountId: number, user: User): Promise<ChatProviderTwilio[]> {
    const allProviders = await this.repository
      .createQueryBuilder('tp')
      .where('tp.account_id = :accountId', { accountId })
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

  async getProviderWithSettings(accountId: number, providerId: number): Promise<ChatProviderTwilio> {
    const provider = await this.chatProviderService.findOne(
      accountId,
      null,
      { providerId },
      { expand: ['accessibleUsers', 'responsibleUsers', 'supervisorUsers', 'entitySettings'] },
    );

    const twilioProvider = await this.getProvider(accountId, providerId);
    twilioProvider.provider = provider;

    return twilioProvider;
  }

  private async getProvider(accountId: number, providerId: number): Promise<ChatProviderTwilio> {
    const provider = await this.repository.findOneBy({ accountId, providerId });

    if (!provider) {
      throw NotFoundError.withId(ChatProviderTwilio, providerId);
    }

    return provider;
  }

  private async getProviderByPhoneNumber(phoneNumber: string): Promise<ChatProviderTwilio> {
    const twilioProvider = await this.repository.findOneBy({ phoneNumber });

    if (!twilioProvider) {
      throw NotFoundError.withId(ChatProviderTwilio, phoneNumber);
    }

    return twilioProvider;
  }

  async create(accountId: number, userId: number, dto: CreateTwilioProviderDto): Promise<ChatProviderTwilio> {
    const provider = await this.chatProviderService.create(accountId, userId, dto);

    const twilioProvider = await this.repository.save(ChatProviderTwilio.fromDto(accountId, provider.id, dto));
    twilioProvider.provider = provider;

    return twilioProvider;
  }

  async update(accountId: number, providerId: number, dto: UpdateTwilioProviderDto): Promise<ChatProviderTwilio> {
    const provider = await this.chatProviderService.update(accountId, null, providerId, dto);

    const twilioProvider = await this.getProvider(accountId, providerId);
    await this.repository.save(twilioProvider.update(dto));

    twilioProvider.provider = provider;

    return twilioProvider;
  }

  async delete({ accountId, userId, providerId }: { accountId: number; userId: number; providerId: number }) {
    await this.repository.delete({ accountId, providerId });
    await this.chatProviderService.delete({ accountId, userId, providerId });
  }

  async notifyChatUsers(
    account: Account,
    message: ChatMessage,
    type: MultichatEventType,
    provider: ChatProvider,
    users: ChatUser[],
  ): Promise<void> {
    const twilioProvider = await this.getProvider(account.id, provider.id);
    const twilio = TwilioSDK(twilioProvider.accountSid, twilioProvider.authToken);
    const from = this.formatPhoneNumber(twilioProvider.phoneNumber);

    switch (type) {
      case MultichatEventType.ChatMessageCreated:
        await this.sendMessage(account, twilio, from, message, users);
        break;
    }
  }

  private async sendMessage(
    account: Account,
    twilio: TwilioSDK.Twilio,
    from: string,
    message: ChatMessage,
    users: ChatUser[],
  ): Promise<void> {
    const fileUrls =
      message.files && message.files.length > 0
        ? message.files.map((file) => this.storageUrlService.getTemporaryUrl(file.fileId, account.subdomain))
        : undefined;

    await Promise.all(
      users
        .filter((u) => u.externalUser)
        .map(async (user) => {
          try {
            await twilio.messages.create({
              from,
              to: this.formatPhoneNumber(user.externalUser.phone),
              body: message.text,
              mediaUrl: fileUrls,
            });
          } catch (e) {
            this.logger.error(`Send message error`, (e as Error)?.stack);
          }
        }),
    );
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
    try {
      const twilioProvider = await this.getProvider(accountId, providerId);
      const twilio = TwilioSDK(twilioProvider.accountSid, twilioProvider.authToken);

      await twilio.messages.create({
        from: this.formatPhoneNumber(twilioProvider.phoneNumber),
        to: this.formatPhoneNumber(phone),
        body: message,
      });
    } catch (e) {
      this.logger.error(`Send message error`, (e as Error)?.stack);
    }
  }

  async createChatExternalId(userExternalId: string): Promise<string> {
    return this.formatChatExternalId(userExternalId);
  }

  private formatChatExternalId(userExternalId: string): string {
    return userExternalId;
  }

  async handleWebhook(body: unknown): Promise<string> {
    const message = body as TwilioRequestBody;
    if (message.To) {
      const [, providerPhoneNumber] = this.parsePhoneNumber(message.To);
      const twilioProvider = await this.getProviderByPhoneNumber(providerPhoneNumber);
      if (twilioProvider) {
        const account = await this.accountService.findOne({ accountId: twilioProvider.accountId });
        await this.handleMessage({ account, twilioProvider, message });
      }
    }

    return new TwilioSDK.twiml.MessagingResponse().toString();
  }

  private async handleMessage({
    account,
    twilioProvider,
    message,
  }: {
    account: Account;
    twilioProvider: ChatProviderTwilio;
    message: TwilioRequestBody;
  }) {
    this.logger.debug(`Handle message: ${JSON.stringify(message)}`);
    try {
      const chatUser = await this.getChatUser({
        accountId: account.id,
        providerId: twilioProvider.providerId,
        message,
      });
      if (chatUser) {
        const fileIds = await this.getMessageFileIds(account.id, twilioProvider, message);
        await this.chatMessageService.createExternal(account, chatUser, message.Body, message.MessageSid, fileIds);
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
    message: TwilioRequestBody;
  }): Promise<ChatUser | null> {
    const [, userPhoneNumber] = this.parsePhoneNumber(message.From);
    const [firstName, lastName] = splitByFirstSpace(message.ProfileName || message.WaId || userPhoneNumber);

    return this.chatProviderService.getChatUserExternal({
      accountId,
      providerId,
      chatExternalId: this.formatChatExternalId(userPhoneNumber),
      externalUserDto: {
        externalId: userPhoneNumber,
        firstName,
        lastName,
        phone: userPhoneNumber,
      },
    });
  }

  private async getMessageFileIds(
    accountId: number,
    twilioProvider: ChatProviderTwilio,
    data: TwilioRequestBody,
  ): Promise<string[] | null> {
    if (!data.NumMedia) {
      return null;
    }

    const auth = `Basic ${Buffer.from(`${twilioProvider.accountSid}:${twilioProvider.authToken}`).toString('base64')}`;
    const numMedia = parseInt(data.NumMedia, 10);
    const fileIds: string[] = [];
    for (let i = 0; i < numMedia; i++) {
      const fileUrl = data[`MediaUrl${i}`];

      if (fileUrl) {
        const fileInfo = await this.storageService.storeExternalFile(accountId, null, fileUrl, {
          authorization: auth,
        });
        if (fileInfo) {
          fileIds.push(fileInfo.id);
        }
      }
    }

    return fileIds;
  }

  private formatPhoneNumber(phoneNumber: string): string {
    const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

    return `whatsapp:${formattedPhoneNumber}`;
  }

  private parsePhoneNumber(phoneNumber: string): [ChatProviderType, string] {
    const match = phoneNumber.match(/^whatsapp:(.+)$/);
    if (!match) {
      throw new Error('Unsupported phone number format');
    }

    return [ChatProviderType.Twilio, match[1]];
  }
}
