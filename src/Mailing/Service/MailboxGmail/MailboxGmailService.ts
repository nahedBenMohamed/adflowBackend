import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google, Auth, gmail_v1 } from 'googleapis';
import addressparser from 'nodemailer/lib/addressparser';

import { formatState, FrontendRoute, isUnique, parseState, StringUtil, UrlGeneratorService } from '@/common';
import { AccountService } from '@/modules/iam/account/account.service';
import { StorageFile } from '@/modules/storage/types/storage-file';

import { MailConfig } from '../../config';
import {
  detectMailboxFolderType,
  FolderMessages,
  MailboxFolderExternal,
  MailboxFolderType,
  MailboxSyncResult,
  MailMessageAttachment,
  MailMessageExternal,
  MailMessagePayloadExternal,
  SendMailMessageDto,
} from '../../common';
import { Mailbox } from '../../mailbox/entities';
import { MailboxService } from '../../mailbox/services';
import { MailboxFolderService } from '../../mailbox-folder';
import { MailIntegration, MailProvider, MailProviderCapability } from '../../mail-provider';
import { MailMessagePayload } from '../../mail-message-payload';
import { HEADER_ENTITY_ID, MailMessageBuilderService } from '../../mail-message-builder';

import { MailboxSettingsGmail } from '../../Model/MailboxGmail/MailboxSettingsGmail';
import { MailMessage } from '../../Model/MailMessage/MailMessage';

import { MailMessageService } from '../MailMessage/MailMessageService';

const CALLBACK_PATH = '/api/mailing/settings/mailboxes/gmail/callback';

const GmailSystemLabels = ['INBOX', 'SENT', 'IMPORTANT', 'STARRED', 'TRASH', 'DRAFT', 'SPAM'];
const IgnoreMimeType = [
  'message/delivery-status',
  'message/global-delivery-status',
  'message/disposition-notification',
];

const ProviderName = 'gmail';

@Injectable()
@MailIntegration(ProviderName)
export class MailboxGmailService implements MailProvider {
  private readonly logger = new Logger(MailboxGmailService.name);
  private readonly _config: MailConfig;
  private oAuth2Client: Auth.OAuth2Client;

  constructor(
    private readonly urlGenerator: UrlGeneratorService,
    private readonly configService: ConfigService,
    @InjectRepository(MailboxSettingsGmail)
    private readonly repository: Repository<MailboxSettingsGmail>,
    private readonly accountService: AccountService,
    @Inject(forwardRef(() => MailboxService))
    private readonly mailboxService: MailboxService,
    private readonly mailboxFolderService: MailboxFolderService,
    @Inject(forwardRef(() => MailMessageService))
    private readonly mailMessageService: MailMessageService,
    private readonly mailMessageBuilder: MailMessageBuilderService,
  ) {
    this._config = this.configService.get<MailConfig>('mail');
    this.oAuth2Client = this.getOAuth2Client();
  }

  isCapable(capability: MailProviderCapability): boolean {
    if (capability === 'thread') {
      return true;
    }

    return false;
  }

  async getAuthorizeUrl({ accountId, mailboxId }: { accountId: number; mailboxId: number }): Promise<string> {
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/gmail.modify'],
      redirect_uri: this.getRedirectUrl(),
      state: formatState(accountId, mailboxId),
    });
    return authUrl as string;
  }

  async processAuthCode({ code, state }: { code: string; state: string }): Promise<string> {
    const { tokens } = await this.oAuth2Client.getToken({
      code,
      redirect_uri: this.getRedirectUrl(),
    });
    const [accountId, mailboxId] = parseState(state, Number);
    const mailbox = await this.mailboxService.findOne({ accountId, mailboxId });
    const profile = await this.getProfile(tokens);
    await this.repository.save(new MailboxSettingsGmail(mailbox.id, mailbox.accountId, tokens, profile.historyId));
    if (profile.emailAddress && profile.emailAddress !== mailbox.email) {
      await this.mailboxService.update({
        accountId: mailbox.accountId,
        mailboxId: mailbox.id,
        dto: { email: profile.emailAddress },
      });
    }
    const { subdomain } = await this.accountService.findOne({ accountId: mailbox.accountId });

    return this.urlGenerator.createUrl({
      route: FrontendRoute.settings.mailing(),
      subdomain,
      query: { mailboxId: String(mailbox.id) },
    });
  }

  private getRedirectUrl() {
    return this.urlGenerator.createUrl({ route: CALLBACK_PATH });
  }

  private getOAuth2Client(tokens?: Auth.Credentials): Auth.OAuth2Client {
    const client = new google.auth.OAuth2(this._config.gmail.apiClientId, this._config.gmail.apiClientSecret);
    if (tokens) {
      client.setCredentials(tokens);
    }
    return client;
  }

  private async getProfile(tokens: Auth.Credentials) {
    const gmail = google.gmail({ version: 'v1', auth: this.getOAuth2Client(tokens) });
    const { data } = await gmail.users.getProfile({ userId: 'me' });
    return data;
  }

  async sync({
    mailbox,
    syncFull,
    syncDate,
  }: {
    mailbox: Mailbox;
    syncFull?: boolean;
    syncDate?: Date;
  }): Promise<MailboxSyncResult> {
    return syncFull ? this.syncFull(mailbox, syncDate) : this.syncPartial(mailbox);
  }

  async syncFull(mailbox: Mailbox, syncDate: Date | null): Promise<MailboxSyncResult> {
    try {
      const settings = await this.repository.findOneBy({ mailboxId: mailbox.id });
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuth2Client(settings.tokens) });

      await this.updateFolders(mailbox, gmail);

      if (syncDate) {
        const added: string[] = [];
        let historyId: string = undefined;
        let nextPageToken: string = undefined;
        let listMessages = true;
        while (listMessages) {
          const { data } = await gmail.users.messages.list({
            userId: 'me',
            pageToken: nextPageToken,
            includeSpamTrash: true,
          });
          if (!historyId && data.messages.length > 0) {
            const message = await gmail.users.messages.get({ userId: 'me', id: data.messages[0].id });
            historyId = message.data.historyId;
          }

          nextPageToken = data.nextPageToken;
          listMessages = !!nextPageToken;

          added.push(...data.messages.map((m) => m.id));
        }

        if (added.length) {
          await this.updateMessages({ accountId: mailbox.accountId, mailbox, gmail, added });
        }

        if (historyId) {
          await this.repository.update(mailbox.id, { historyId });
        }
      }

      return { result: true, message: null };
    } catch (e) {
      this.logger.warn(`Gmail full synchronization error for mailbox ${mailbox.id}. ${e.toString()}`);
      if (e instanceof Error) {
        return { result: false, message: e.message };
      } else {
        return { result: false, message: e.toString() };
      }
    }
  }

  async syncPartial(mailbox: Mailbox): Promise<MailboxSyncResult> {
    try {
      const settings = await this.repository.findOneBy({ mailboxId: mailbox.id });
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuth2Client(settings.tokens) });

      await this.updateFolders(mailbox, gmail);

      let added: string[] = [];
      let updated: string[] = [];
      let deleted: string[] = [];
      let historyId = settings.historyId;
      let nextPageToken: string = undefined;
      let checkHistory = true;
      while (checkHistory) {
        const { data } = await gmail.users.history.list({
          userId: 'me',
          startHistoryId: settings.historyId,
          pageToken: nextPageToken,
        });
        if (!nextPageToken) {
          historyId = data.historyId;
        }

        nextPageToken = data.nextPageToken;
        checkHistory = !!nextPageToken;

        if (data.history) {
          for (const record of data.history) {
            let recordMessagesAdded: string[] = [];
            let recordMessagesUpdated: string[] = [];
            let recordMessagesDeleted: string[] = [];
            if (record.messagesAdded) {
              recordMessagesAdded = record.messagesAdded.map((m) => m.message.id).filter(isUnique);
            }
            if (record.messages) {
              recordMessagesUpdated = record.messages.map((m) => m.id).filter(isUnique);
            }
            if (record.messagesDeleted) {
              recordMessagesDeleted = record.messagesDeleted.map((m) => m.message.id).filter(isUnique);
            }
            if (recordMessagesUpdated.length > 0) {
              recordMessagesUpdated = recordMessagesUpdated.filter((m) => !added.includes(m));
              updated.push(...recordMessagesUpdated);
              deleted = deleted.filter((m) => !recordMessagesUpdated.includes(m));
            }
            if (recordMessagesDeleted.length > 0) {
              added = added.filter((m) => !recordMessagesDeleted.includes(m));
              updated = updated.filter((m) => !recordMessagesDeleted.includes(m));
              deleted.push(...recordMessagesDeleted);
            }
            if (recordMessagesAdded.length > 0) {
              added.push(...recordMessagesAdded);
              updated = updated.filter((m) => !recordMessagesAdded.includes(m));
              deleted = deleted.filter((m) => !recordMessagesAdded.includes(m));
            }
          }
        }
      }

      added = added.filter(isUnique);
      updated = updated.filter(isUnique);
      deleted = deleted.filter(isUnique);

      if (added.length || updated.length || deleted.length) {
        await this.updateMessages({ accountId: mailbox.accountId, mailbox, gmail, added, updated, deleted });
      }

      if (historyId) {
        await this.repository.update(settings.mailboxId, { historyId });
      }

      return { result: true, message: null };
    } catch (e) {
      this.logger.warn(`Gmail partial synchronization error for mailbox ${mailbox.id}. ${e.toString()}`);
      if (e instanceof Error) {
        return { result: false, message: e.message };
      } else {
        return { result: false, message: e.toString() };
      }
    }
  }

  async getAttachment({
    mailbox,
    message,
    payload,
  }: {
    mailbox: Mailbox;
    message: MailMessage;
    payload: MailMessagePayload;
  }): Promise<MailMessageAttachment | null> {
    try {
      const settings = await this.repository.findOneBy({ mailboxId: mailbox.id });
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuth2Client(settings.tokens) });

      const { data } = await gmail.users.messages.attachments.get({
        userId: 'me',
        messageId: message.externalId,
        id: payload.attachment,
      });

      return {
        mimeType: payload.mimeType,
        filename: payload.filename,
        content: new Uint8Array(Buffer.from(data.data, 'base64')),
      };
    } catch (e) {
      this.logger.error(`Gmail get attachment error for mailbox ${mailbox.id}`, (e as Error)?.stack);
      return null;
    }
  }

  private async updateFolders(mailbox: Mailbox, gmail: gmail_v1.Gmail) {
    const { data } = await gmail.users.labels.list({ userId: 'me' });
    const folders = data.labels
      .filter((l) => l.type === 'user' || GmailSystemLabels.includes(l.id))
      .map((label) => this.convertToExternalFolder(label));
    if (folders.length) {
      await this.mailboxFolderService.processExternal({
        accountId: mailbox.accountId,
        mailboxId: mailbox.id,
        extFolders: folders,
      });
    }
  }

  private convertToExternalFolder(label: gmail_v1.Schema$Label): MailboxFolderExternal {
    return {
      id: label.id,
      name: label.name,
      type: detectMailboxFolderType({ name: label.id }),
    };
  }

  private async updateMessages({
    accountId,
    mailbox,
    gmail,
    added,
    updated,
    deleted,
  }: {
    accountId: number;
    mailbox: Mailbox;
    gmail: gmail_v1.Gmail;
    added?: string[];
    updated?: string[];
    deleted?: string[];
  }) {
    const addedMsgs = added?.length
      ? (await Promise.all(added.map((messageId) => this.findMessage(mailbox.id, gmail, messageId)))).filter(Boolean)
      : undefined;

    const updatedMsgs = updated?.length
      ? (await Promise.all(updated.map((messageId) => this.findMessage(mailbox.id, gmail, messageId)))).filter(Boolean)
      : undefined;

    await this.mailMessageService.processExternalMessages({
      accountId,
      mailbox,
      added: addedMsgs,
      updated: updatedMsgs,
      deleted,
    });
  }

  private async findMessage(
    mailboxId: number,
    gmail: gmail_v1.Gmail,
    messageId: string,
  ): Promise<MailMessageExternal | null> {
    try {
      const { data } = await gmail.users.messages.get({ userId: 'me', id: messageId });
      const from = this.getMessageHeadersValue(data.payload.headers, 'From');
      if (!from) {
        this.logger.warn(
          `Null 'From' value! Mailbox: ${mailboxId}. Message payload header: ${JSON.stringify(data.payload.headers)}`,
        );
        return null;
      }
      const payloads = this.getMessagePayloads(data.payload);
      const hasAttachment = payloads.some((payload) => payload.attachmentId);
      const to = this.getMessageHeadersValue(data.payload.headers, 'To');
      const replyTo = this.getMessageHeadersValue(data.payload.headers, 'Reply-To');
      const cc = this.getMessageHeadersValue(data.payload.headers, 'Cc');
      const isUnread = data.labelIds.includes('UNREAD');
      const entityId = this.getMessageHeadersValue(data.payload.headers, HEADER_ENTITY_ID);
      return {
        id: data.id,
        threadId: data.threadId,
        snippet: data.snippet,
        sentFrom: { text: from, values: addressparser(from, { flatten: true }) },
        sentTo: to ? { text: to, values: addressparser(to, { flatten: true }) } : null,
        replyTo: replyTo ? { text: replyTo, values: addressparser(replyTo, { flatten: true }) } : null,
        cc: cc ? { text: cc, values: addressparser(cc, { flatten: true }) } : null,
        subject: this.getMessageHeadersValue(data.payload.headers, 'Subject'),
        date: new Date(parseInt(data.internalDate)),
        hasAttachment,
        messageId: this.getMessageHeadersValue(data.payload.headers, 'Message-Id'),
        inReplyTo: this.getMessageHeadersValue(data.payload.headers, 'In-Reply-To'),
        references: this.getMessageHeadersValue(data.payload.headers, 'References')
          ?.split(',')
          ?.map((i) => i.trim()),
        isSeen: !isUnread,
        entityId: entityId ? parseInt(entityId) : null,
        folders: data.labelIds,
        payloads,
      };
    } catch {
      return null;
    }
  }

  private getMessageHeadersValue(headers: gmail_v1.Schema$MessagePartHeader[], name: string): string {
    return headers.find((header) => header.name.toLowerCase() === name.toLowerCase())?.value;
  }

  private getMessagePayloads(part: gmail_v1.Schema$MessagePart): MailMessagePayloadExternal[] {
    if (part.mimeType.startsWith('text') || part.filename || part.body?.attachmentId) {
      const attachmentId = part.body?.attachmentId ?? null;
      const content = part.body?.data ? StringUtil.decode(part.body.data, 'base64', 'utf-8') : null;
      const size = part.body?.size ?? null;
      return [{ id: part.partId, mimeType: part.mimeType, filename: part.filename, attachmentId, content, size }];
    } else if (part.mimeType.startsWith('multipart') || part.mimeType === 'message/rfc822') {
      const payloads: MailMessagePayloadExternal[] = [];
      for (const nestedPart of part.parts) {
        const nestedPayloads = this.getMessagePayloads(nestedPart);
        if (nestedPayloads.length > 0) {
          payloads.push(...nestedPayloads);
        }
      }
      return payloads;
    } else if (IgnoreMimeType.includes(part.mimeType)) {
      //TODO: process delivery status
      return [];
    } else if (part.mimeType.startsWith('image')) {
      //TODO: process inline images
      return [];
    } else {
      this.logger.error(`Gmail synchronization. Unknown message part mime type '${part.mimeType}' or empty file name`);
      return [];
    }
  }

  async send({
    accountId,
    mailbox,
    userName,
    dto,
    replyToMessage,
    attachments,
  }: {
    accountId: number;
    mailbox: Mailbox;
    userName: string;
    dto: SendMailMessageDto;
    replyToMessage?: MailMessage | null;
    attachments: StorageFile[];
  }): Promise<MailMessageExternal | null> {
    try {
      const settings = await this.repository.findOneBy({ accountId, mailboxId: mailbox.id });
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuth2Client(settings.tokens) });

      const mail = await this.mailMessageBuilder.createNodemailerMessage(
        mailbox.email,
        userName,
        dto,
        replyToMessage,
        attachments,
      );
      const request = {
        threadId: replyToMessage ? replyToMessage.threadId : null,
        raw: await this.mailMessageBuilder.createRawMessage(mail),
      };

      const { data } = await gmail.users.messages.send({ userId: 'me', requestBody: request });

      if (data?.id) {
        return await this.findMessage(mailbox.id, gmail, data.id);
      }
    } catch (e) {
      const error = e as Error;
      this.logger.error(`SMTP send message error for mailbox ${mailbox.id}: ${error?.message}`, error?.stack);
    }

    return null;
  }

  async setSeen({
    mailbox,
    seen,
    messages,
  }: {
    accountId: number;
    mailbox: Mailbox;
    seen: boolean;
    messages: { threadId: string } | FolderMessages[];
  }): Promise<boolean> {
    if (Array.isArray(messages)) {
      const messageIds = messages.map((m) => m.messageIds).flat();
      return seen
        ? this.removeLabelFromMessages(mailbox, messageIds, ['UNREAD'])
        : this.addLabelToMessages(mailbox, messageIds, ['UNREAD']);
    } else {
      return seen
        ? this.removeLabelFromThread(mailbox, messages.threadId, ['UNREAD'])
        : this.addLabelToThread(mailbox, messages.threadId, ['UNREAD']);
    }
  }
  private async addLabelToThread(mailbox: Mailbox, threadId: string, labels: string[]): Promise<boolean> {
    try {
      const settings = await this.repository.findOneBy({ mailboxId: mailbox.id });
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuth2Client(settings.tokens) });

      await gmail.users.threads.modify({
        userId: 'me',
        id: threadId,
        requestBody: { addLabelIds: labels },
      });

      return true;
    } catch (e) {
      this.logger.error(`Gmail add label ${labels} to thread error for mailbox ${mailbox.id}`, (e as Error)?.stack);
      return false;
    }
  }
  private async removeLabelFromThread(mailbox: Mailbox, threadId: string, labels: string[]): Promise<boolean> {
    try {
      const settings = await this.repository.findOneBy({ mailboxId: mailbox.id });
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuth2Client(settings.tokens) });

      await gmail.users.threads.modify({
        userId: 'me',
        id: threadId,
        requestBody: { removeLabelIds: labels },
      });

      return true;
    } catch (e) {
      this.logger.error(`Gmail remove label ${labels} to thread error for mailbox ${mailbox.id}`, (e as Error)?.stack);
      return false;
    }
  }
  private async addLabelToMessages(mailbox: Mailbox, messageExtIds: string[], labels: string[]): Promise<boolean> {
    try {
      const settings = await this.repository.findOneBy({ mailboxId: mailbox.id });
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuth2Client(settings.tokens) });

      await gmail.users.messages.batchModify({
        userId: 'me',
        requestBody: { ids: messageExtIds, addLabelIds: labels },
      });

      return true;
    } catch (e) {
      this.logger.error(`Gmail add label ${labels} to messages error for mailbox ${mailbox.id}`, (e as Error)?.stack);
      return false;
    }
  }
  private async removeLabelFromMessages(mailbox: Mailbox, messageExtIds: string[], labels: string[]): Promise<boolean> {
    try {
      const settings = await this.repository.findOneBy({ mailboxId: mailbox.id });
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuth2Client(settings.tokens) });

      await gmail.users.messages.batchModify({
        userId: 'me',
        requestBody: { ids: messageExtIds, removeLabelIds: labels },
      });

      return true;
    } catch (e) {
      this.logger.error(
        `Gmail remove label ${labels} to messages error for mailbox ${mailbox.id}`,
        (e as Error)?.stack,
      );
      return false;
    }
  }

  async trash({
    mailbox,
    messages,
  }: {
    mailbox: Mailbox;
    messages: { threadId: string } | FolderMessages[];
  }): Promise<boolean> {
    if (Array.isArray(messages)) {
      const messageIds = messages.map((m) => m.messageIds).flat();
      return this.trashMessages(mailbox, messageIds);
    } else {
      return this.trashThread(mailbox, messages.threadId);
    }
  }
  private async trashMessages(mailbox: Mailbox, messageExtIds: string[]): Promise<boolean> {
    try {
      const settings = await this.repository.findOneBy({ mailboxId: mailbox.id });
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuth2Client(settings.tokens) });

      for (const messageExtId of messageExtIds) {
        await gmail.users.messages.trash({ userId: 'me', id: messageExtId });
      }

      return true;
    } catch (e) {
      this.logger.error(`Gmail trash message error for mailbox ${mailbox.id}`, (e as Error)?.stack);
      return false;
    }
  }
  private async trashThread(mailbox: Mailbox, threadId: string): Promise<boolean> {
    try {
      const settings = await this.repository.findOneBy({ mailboxId: mailbox.id });
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuth2Client(settings.tokens) });

      await gmail.users.threads.trash({ userId: 'me', id: threadId });

      return true;
    } catch (e) {
      this.logger.error(`Gmail trash thread error for mailbox ${mailbox.id}`, (e as Error)?.stack);
      return false;
    }
  }

  async untrash({
    mailbox,
    messages,
  }: {
    mailbox: Mailbox;
    messages: { threadId: string } | FolderMessages[];
  }): Promise<boolean> {
    if (Array.isArray(messages)) {
      const messageIds = messages.map((m) => m.messageIds).flat();
      return this.untrashMessages(mailbox, messageIds);
    } else {
      return this.untrashThread(mailbox, messages.threadId);
    }
  }
  private async untrashMessages(mailbox: Mailbox, messageExtIds: string[]): Promise<boolean> {
    try {
      const settings = await this.repository.findOneBy({ mailboxId: mailbox.id });
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuth2Client(settings.tokens) });

      for (const messageExtId of messageExtIds) {
        await gmail.users.messages.untrash({ userId: 'me', id: messageExtId });
      }

      return true;
    } catch (e) {
      this.logger.error(`Gmail untrash message error for mailbox ${mailbox.id}`, (e as Error)?.stack);
      return false;
    }
  }
  private async untrashThread(mailbox: Mailbox, threadId: string): Promise<boolean> {
    try {
      const settings = await this.repository.findOneBy({ mailboxId: mailbox.id });
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuth2Client(settings.tokens) });

      await gmail.users.threads.untrash({ userId: 'me', id: threadId });

      return true;
    } catch (e) {
      this.logger.error(`Gmail untrash thread error for mailbox ${mailbox.id}`, (e as Error)?.stack);
      return false;
    }
  }

  async spam({
    mailbox,
    messages,
  }: {
    mailbox: Mailbox;
    messages: { threadId: string } | FolderMessages[];
  }): Promise<boolean> {
    if (Array.isArray(messages)) {
      const messageIds = messages.map((m) => m.messageIds).flat();
      return this.addMessagesToFolder(mailbox.accountId, mailbox, messageIds, MailboxFolderType.Junk);
    } else {
      return this.addThreadToFolder(mailbox.accountId, mailbox, messages.threadId, MailboxFolderType.Junk);
    }
  }
  private async addThreadToFolder(
    accountId: number,
    mailbox: Mailbox,
    threadId: string,
    type: MailboxFolderType,
  ): Promise<boolean> {
    const toFolder = await this.mailboxFolderService.findOne({ accountId, mailboxId: mailbox.id, type });
    return await this.addLabelToThread(mailbox, threadId, [toFolder.externalId]);
  }
  private async addMessagesToFolder(
    accountId: number,
    mailbox: Mailbox,
    messageExtIds: string[],
    type: MailboxFolderType,
  ): Promise<boolean> {
    const toFolder = await this.mailboxFolderService.findOne({ accountId, mailboxId: mailbox.id, type });
    return await this.addLabelToMessages(mailbox, messageExtIds, [toFolder.externalId]);
  }

  async unspam({
    mailbox,
    messages,
  }: {
    mailbox: Mailbox;
    messages: { threadId: string } | FolderMessages[];
  }): Promise<boolean> {
    if (Array.isArray(messages)) {
      const messageIds = messages.map((m) => m.messageIds).flat();
      return this.removeMessagesFromFolder(mailbox.accountId, mailbox, messageIds, MailboxFolderType.Junk);
    } else {
      return this.removeThreadFromFolder(mailbox.accountId, mailbox, messages.threadId, MailboxFolderType.Junk);
    }
  }
  private async removeThreadFromFolder(
    accountId: number,
    mailbox: Mailbox,
    threadId: string,
    type: MailboxFolderType,
  ): Promise<boolean> {
    const fromFolder = await this.mailboxFolderService.findOne({ accountId, mailboxId: mailbox.id, type });
    return await this.removeLabelFromThread(mailbox, threadId, [fromFolder.externalId]);
  }
  private async removeMessagesFromFolder(
    accountId: number,
    mailbox: Mailbox,
    messageExtIds: string[],
    type: MailboxFolderType,
  ): Promise<boolean> {
    const fromFolder = await this.mailboxFolderService.findOne({ accountId, mailboxId: mailbox.id, type });
    return await this.removeLabelFromMessages(mailbox, messageExtIds, [fromFolder.externalId]);
  }
}
