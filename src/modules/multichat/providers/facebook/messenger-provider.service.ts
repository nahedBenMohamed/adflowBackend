import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { catchError } from 'rxjs/operators';
import { lastValueFrom } from 'rxjs';
import * as crypto from 'crypto';

import {
  ForbiddenError,
  formatState,
  formatUrlQuery,
  FrontendRoute,
  NotFoundError,
  parseState,
  StringUtil,
  UrlGeneratorService,
} from '@/common';

import { AccountService } from '@/modules/iam/account/account.service';
import { Account } from '@/modules/iam/account/entities/account.entity';
import { User } from '@/modules/iam/user/entities/user.entity';
import { StorageUrlService } from '@/modules/storage/storage-url.service';
import { StorageService } from '@/modules/storage/storage.service';

import { ChatProviderStatus, ChatProviderTransport, ChatProviderType, MultichatEventType } from '../../common';
import { ChatUser } from '../../chat-user';
import { ChatMessage } from '../../chat-message/entities/chat-message.entity';
import { ChatMessageService } from '../../chat-message/services/chat-message.service';
import { ChatProvider } from '../../chat-provider/entities';
import { ChatProviderService } from '../../chat-provider/services/chat-provider.service';

import { FacebookConfig } from './config/facebook.config';
import { CreateMessengerProviderDto, UpdateMessengerProviderDto } from './dto';
import { ChatProviderMessenger } from './entities';

const FacebookUrls = {
  facebook: 'https://www.facebook.com',
  oauthDialog: () => `${FacebookUrls.facebook}/dialog/oauth`,
  graph: 'https://graph.facebook.com/v19.0',
  oauthAccessToken: () => `${FacebookUrls.graph}/oauth/access_token`,
  profile: (profileId: string) => `${FacebookUrls.graph}/${profileId}`,
  messages: (profileId: string) => `${FacebookUrls.profile(profileId)}/messages`,
  subscriptions: (appId: string) => `${FacebookUrls.profile(appId)}/subscriptions`,
  subscribedApps: (profileId: string) => `${FacebookUrls.profile(profileId)}/subscribed_apps`,
  accounts: (profileId: string) => `${FacebookUrls.profile(profileId)}/accounts`,
  permissions: (profileId: string) => `${FacebookUrls.profile(profileId)}/permissions`,
} as const;

const CALLBACK_PATH = '/api/chat/messenger/callback';
//const WEBHOOK_PATH = '/api/chat/messenger/webhook';

@Injectable()
export class MessengerProviderService {
  private readonly logger = new Logger(MessengerProviderService.name);
  private _config: FacebookConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    @InjectRepository(ChatProviderMessenger)
    private readonly repository: Repository<ChatProviderMessenger>,
    private readonly accountService: AccountService,
    private readonly storageService: StorageService,
    private readonly storageUrlService: StorageUrlService,
    private readonly urlGenerator: UrlGeneratorService,
    private readonly chatProviderService: ChatProviderService,
    @Inject(forwardRef(() => ChatMessageService))
    private readonly chatMessageService: ChatMessageService,
  ) {
    this._config = this.configService.get<FacebookConfig>('facebook');
  }

  getConnectUrl(accountId: number, userId: number, display?: string): string {
    return formatUrlQuery(FacebookUrls.oauthDialog(), {
      response_type: 'code',
      override_default_response_type: 'true',
      display: display,
      client_id: this._config.appId,
      redirect_uri: this.getAuthRedirectUrl(),
      config_id: this._config.messengerAuthConfigId,
      state: formatState(accountId, userId),
      auth_type: 'rerequest',
    });
  }

  private getAuthRedirectUrl(): string {
    return this.urlGenerator.createUrl({ route: CALLBACK_PATH });
  }

  /*
  private getMessageWebhookUrl(): string {
    return this.urlGenerator.createUrl(WEBHOOK_PATH);
  }
  */

  async authCallback(code: string, state: string, error?: string): Promise<string> {
    const [accountId, userId] = parseState(state, Number);
    const account = await this.accountService.findOne({ accountId });

    const redirectUrl = this.urlGenerator.createUrl({
      route: FrontendRoute.settings.facebook.messenger(),
      subdomain: account.subdomain,
    });

    if (error) {
      return formatUrlQuery(redirectUrl, { error });
    }

    const accessToken = await this.getAccessToken(code);

    const profile = await this.getPageProfile('me', accessToken);

    if (!profile?.accounts?.data) {
      return formatUrlQuery(redirectUrl, { error: 'true' });
    }

    const providerIds: number[] = [];
    for (const { id, name, access_token } of profile.accounts.data) {
      if (await this.subscribePage(id, access_token)) {
        const fbmProviders = await this.findProvidersByPageId(id, account.id);
        let fbmProvider = fbmProviders.length > 0 ? fbmProviders[0] : null;
        if (fbmProvider) {
          fbmProvider = await this.updateAccessToken(fbmProvider, accessToken);
        } else {
          fbmProvider = await this.create(accountId, userId, {
            type: ChatProviderType.Facebook,
            transport: ChatProviderTransport.Messenger,
            title: name,
            status: ChatProviderStatus.Active,
            accessibleUserIds: [],
            responsibleUserIds: [],
            userId: profile.id,
            userAccessToken: accessToken,
            pageId: id,
            pageAccessToken: access_token,
          });
        }
        providerIds.push(fbmProvider.providerId);
      }
    }

    return formatUrlQuery(redirectUrl, { providerId: String(providerIds[0]) });
  }

  private async getAccessToken(code: string): Promise<string | null> {
    try {
      const response$ = this.httpService
        .get(FacebookUrls.oauthAccessToken(), {
          params: {
            client_id: this._config.appId,
            client_secret: this._config.appSecret,
            redirect_uri: this.getAuthRedirectUrl(),
            code: code,
          },
        })
        .pipe(
          catchError((error) => {
            this.logger.error(`Get access token error`, (error as Error)?.stack);
            throw error;
          }),
        );
      const response = await lastValueFrom(response$);
      return response.data.access_token;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return null;
    }
  }

  /**
   * Configured in FB App Messenger
   */
  /*
  private async subscribeApp(): Promise<boolean> {
    try {
      const response$ = this.httpService
        .post(FacebookUrls.subscriptions(this._config.appId), null, {
          params: {
            object: 'page',
            callback_url: this.getMessageWebhookUrl(),
            fields: 'messages',
            include_values: true,
            verify_token: this._config.messengerValidationToken,
            access_token: this._config.appAccessToken,
          },
        })
        .pipe(
          catchError((error) => {
            this.logger.error(`Subscribe app error: ${JSON.stringify(error)}`);
            throw error;
          }),
        );
      const response = await lastValueFrom(response$);
      return Boolean(response.data.success);
    } catch (e) {
      return false;
    }
  }
  */

  private async subscribePage(pageId: string, accessToken: string): Promise<boolean> {
    try {
      const response$ = this.httpService
        .post(FacebookUrls.subscribedApps(pageId), null, {
          params: {
            subscribed_fields: 'messages',
            access_token: accessToken,
          },
        })
        .pipe(
          catchError((error) => {
            this.logger.error(`Subscribe app error`, (error as Error)?.stack);
            throw error;
          }),
        );
      const response = await lastValueFrom(response$);
      return Boolean(response.data.success);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return false;
    }
  }

  async handleDeauthoriseRequest(signedRequest: string): Promise<boolean> {
    const userId = await this.deleteAuthData(signedRequest);

    return !!userId;
  }

  async handleDeleteAuthRequest(signedRequest: string) {
    const verifyUrl = this.urlGenerator.createUrl({ route: FrontendRoute.settings.facebook.deleteVerify() });
    const userId = await this.deleteAuthData(signedRequest);

    return { url: verifyUrl, confirmation_code: userId ?? '' };
  }

  private async deleteAuthData(signedRequest: string): Promise<string | null> {
    try {
      const [encodedSig, payload] = signedRequest.split('.');

      const sig = StringUtil.decode(encodedSig, 'base64', 'hex');
      const expectedSig = crypto.createHmac('sha256', this._config.appSecret).update(payload).digest('hex');

      if (sig !== expectedSig) {
        return null;
      }

      const decodedPayload = StringUtil.decode(payload, 'base64', 'utf-8');
      const data = JSON.parse(decodedPayload) as { user_id: string };

      const fbmProviders = await this.findProvidersByPageId(data.user_id);
      for (const fbmProvider of fbmProviders) {
        await this.chatProviderService.update(fbmProvider.accountId, null, fbmProvider.providerId, {
          status: ChatProviderStatus.Deleted,
        });
      }

      return data.user_id;
    } catch (error) {
      this.logger.error(`Handle deauthorise user error`, (error as Error)?.stack);
      return null;
    }
  }

  async getProvidersWithSettings(accountId: number, user: User): Promise<ChatProviderMessenger[]> {
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

  async getProviderWithSettings(accountId: number, providerId: number): Promise<ChatProviderMessenger> {
    const provider = await this.chatProviderService.findOne(
      accountId,
      null,
      { providerId },
      { expand: ['accessibleUsers', 'responsibleUsers', 'supervisorUsers', 'entitySettings'] },
    );

    const fbmProvider = await this.getProvider(accountId, providerId);
    fbmProvider.provider = provider;

    return fbmProvider;
  }

  private async getProvider(accountId: number, providerId: number): Promise<ChatProviderMessenger> {
    const provider = await this.repository.findOneBy({ accountId, providerId });

    if (!provider) {
      throw NotFoundError.withId(ChatProviderMessenger, providerId);
    }

    return provider;
  }

  private async findProvidersByPageId(pageId: string, accountId?: number): Promise<ChatProviderMessenger[]> {
    return this.repository.findBy({ pageId, accountId });
  }

  async create(accountId: number, userId: number, dto: CreateMessengerProviderDto): Promise<ChatProviderMessenger> {
    const provider = await this.chatProviderService.create(accountId, userId, dto);

    const fbmProvider = await this.repository.save(ChatProviderMessenger.fromDto(accountId, provider.id, dto));
    fbmProvider.provider = provider;

    return fbmProvider;
  }

  async update(accountId: number, providerId: number, dto: UpdateMessengerProviderDto): Promise<ChatProviderMessenger> {
    const provider = await this.chatProviderService.update(accountId, null, providerId, dto);

    const fbmProvider = await this.getProvider(accountId, providerId);

    fbmProvider.provider = provider;
    return fbmProvider;
  }

  private async updateAccessToken(
    fbmProvider: ChatProviderMessenger,
    accessToken: string,
  ): Promise<ChatProviderMessenger> {
    fbmProvider.pageAccessToken = accessToken;
    await this.repository.save(fbmProvider);

    return fbmProvider;
  }

  async delete({ accountId, userId, providerId }: { accountId: number; userId: number; providerId: number }) {
    const fbmProvider = await this.getProvider(accountId, providerId);

    if (fbmProvider?.pageAccessToken) {
      await this.revokeAccessToken(fbmProvider.userId, fbmProvider.userAccessToken);
    }

    await this.repository.delete({ accountId, providerId });
    await this.chatProviderService.delete({ accountId, userId, providerId });
  }

  private async revokeAccessToken(userId: string, accessToken: string): Promise<void> {
    try {
      await lastValueFrom(
        this.httpService.delete(FacebookUrls.permissions(userId), { params: { access_token: accessToken } }).pipe(
          catchError((error) => {
            this.logger.error(`Error revoking access token`, (error as Error)?.stack);
            throw error;
          }),
        ),
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return;
    }
  }

  async notifyChatUsers(
    account: Account,
    message: ChatMessage,
    type: MultichatEventType,
    provider: ChatProvider,
    users: ChatUser[],
  ): Promise<void> {
    const fbmProvider = await this.getProvider(account.id, provider.id);
    fbmProvider.provider = provider;

    switch (type) {
      case MultichatEventType.ChatMessageCreated:
        this.sendMessage(account, fbmProvider, message, users);
        break;
    }
  }

  private async sendMessage(
    account: Account,
    provider: ChatProviderMessenger,
    message: ChatMessage,
    users: ChatUser[],
  ): Promise<void> {
    const files =
      message.files && message.files.length > 0
        ? message.files.map((file) => ({
            url: this.storageUrlService.getTemporaryUrl(file.fileId, account.subdomain),
            isImage: file.mimeType.startsWith('image/'),
          }))
        : [];

    for (const user of users) {
      if (user.externalUser) {
        if (message.text) {
          const data = {
            recipient: { id: user.externalUser.externalId },
            message: { text: message.text },
          };

          this.sendOneMessage(data, provider.pageAccessToken);
        }

        for (const file of files) {
          const data = {
            recipient: { id: user.externalUser.externalId },
            message: {
              attachment: { type: 'file', payload: { url: file.url, is_reusable: true } },
            },
          };

          this.sendOneMessage(data, provider.pageAccessToken);
        }
      }
    }
  }

  private async sendOneMessage(data: unknown, pageAccessToken: string): Promise<void> {
    try {
      const response$ = this.httpService
        .post(FacebookUrls.messages('me'), data, {
          params: { access_token: pageAccessToken },
        })
        .pipe(
          catchError((error) => {
            this.logger.error(`Send message error`, (error as Error)?.stack);
            throw error;
          }),
        );
      await lastValueFrom(response$);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return null;
    }
  }

  async createChatExternalId(userExternalId: string): Promise<string> {
    return this.formatChatExternalId(userExternalId);
  }

  private formatChatExternalId(userExternalId: string): string {
    return userExternalId;
  }

  async verifyWebhook(token: string, challenge: string): Promise<string> {
    if (token === this._config.messengerValidationToken) {
      return challenge;
    }
    throw new ForbiddenError();
  }

  async handleWebhook(body: any): Promise<void> {
    this.logger.debug(`Handle webhook body: ${JSON.stringify(body)}`);
    if (body.object !== 'page') {
      return;
    }

    for (const entry of body.entry) {
      const fbmProviders = await this.findProvidersByPageId(entry.id);
      for (const fbmProvider of fbmProviders) {
        const account = await this.accountService.findOne({ accountId: fbmProvider.accountId });
        for (const event of entry.messaging) {
          if (event.message) {
            await this.handleMessage(account, fbmProvider, event);
          }
        }
      }
    }
  }

  private async handleMessage(account: Account, fbmProvider: ChatProviderMessenger, event: any) {
    this.logger.debug(`Handle message: ${JSON.stringify(event)}`);
    try {
      const chatUser = await this.getChatUser({
        accountId: account.id,
        providerId: fbmProvider.providerId,
        pageAccessToken: fbmProvider.pageAccessToken,
        profileId: event.sender.id,
      });
      if (chatUser) {
        const { mid, text, attachments } = event.message;
        const fileIds = attachments ? await this.getMessageFileIds(account.id, attachments) : null;
        await this.chatMessageService.createExternal(account, chatUser, text ?? '', mid, fileIds);
      }
    } catch (error) {
      this.logger.error(`Handle message error`, (error as Error)?.stack);
    }
  }

  private async getChatUser({
    accountId,
    providerId,
    pageAccessToken,
    profileId,
  }: {
    accountId: number;
    providerId: number;
    pageAccessToken: string;
    profileId: string;
  }): Promise<ChatUser | null> {
    const profile = await this.getUserProfile(profileId, pageAccessToken);
    if (!profile.id) {
      return null;
    }

    return this.chatProviderService.getChatUserExternal({
      accountId,
      providerId,
      chatExternalId: this.formatChatExternalId(profile.id),
      externalUserDto: {
        externalId: profile.id,
        firstName: profile.first_name ?? 'Unknown',
        lastName: profile.last_name ?? 'User',
        avatarUrl: profile.picture?.data?.url ?? null,
      },
    });
  }

  private async getPageProfile(profileId: string, pageAccessToken: string): Promise<any> {
    return this.getProfile(profileId, pageAccessToken, 'id,accounts{id,name,access_token}');
  }
  private async getUserProfile(profileId: string, pageAccessToken: string): Promise<any> {
    return this.getProfile(profileId, pageAccessToken, 'id,first_name,last_name,picture');
  }
  private async getProfile(profileId: string, pageAccessToken: string, fields: string): Promise<unknown> {
    try {
      const response$ = this.httpService
        .get(FacebookUrls.profile(profileId), {
          params: { access_token: pageAccessToken, fields: fields },
        })
        .pipe(
          catchError((error) => {
            this.logger.error(`Get user profile error`, (error as Error)?.stack);
            throw error;
          }),
        );
      const response = await lastValueFrom(response$);
      return response.data;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      return { id: profileId };
    }
  }

  private async getMessageFileIds(accountId: number, attachments: any[]): Promise<string[] | null> {
    const fileIds: string[] = [];
    for (const attachment of attachments) {
      const fileUrl = attachment?.payload?.url;

      if (fileUrl) {
        const fileInfo = await this.storageService.storeExternalFile(accountId, null, fileUrl);
        if (fileInfo) {
          fileIds.push(fileInfo.id);
        }
      }
    }

    return fileIds;
  }
}
