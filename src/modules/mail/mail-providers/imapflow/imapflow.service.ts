import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FetchMessageObject,
  ImapFlow,
  Logger as ImapFlowLogger,
  ListTreeResponse,
  MessageAddressObject,
  MessageStructureObject,
  SearchObject,
} from 'imapflow';
import { AddressObject, ParsedMail, simpleParser, Source } from 'mailparser';
import * as iconv from 'iconv-lite';
import * as quotedPrintable from 'quoted-printable';
import { convert } from 'html-to-text';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { v4 as uuidv4 } from 'uuid';

import { DateUtil, NotFoundError, StringUtil, withTimeout } from '@/common';

import { User } from '@/modules/iam/user/entities';
import { StorageFile } from '@/modules/storage/types';
import {
  detectMailboxFolderType,
  EmailAddress,
  EmailAddressValue,
  FolderMessages,
  MailboxFolderExternal,
  MailboxFolderType,
  MailboxSyncMessages,
  MailboxSyncResult,
  MailMessageAttachment,
  MailMessageExternal,
  MailMessagePayloadExternal,
  SendMailMessageDto,
} from '@/Mailing/common';
import { Mailbox, MailboxService } from '@/Mailing/mailbox';
import { MailIntegration, MailProvider, MailProviderCapability } from '@/Mailing/mail-provider';
import { MailMessagePayload } from '@/Mailing/mail-message-payload';
import { MailboxFolderService } from '@/Mailing/mailbox-folder';
import { MailMessageBuilderService, HEADER_ENTITY_ID } from '@/Mailing/mail-message-builder';
import { MailMessage } from '@/Mailing/Model/MailMessage/MailMessage';

import { ImapflowConfig } from './config';
import { CreateMailboxImapflowDto, UpdateMailboxImapflowDto } from './dto';
import { MailboxSettingsImapflow } from './entities';
import { MailConnectionError } from './errors';
import { ImapflowSyncInfo, MailboxImapflow } from './types';

const ProviderName = 'imapflow';

interface FindFilter {
  accountId: number;
  mailboxId?: number;
}

interface ImapflowConnectionParams {
  email: string;
  password: string;
  imapServer: string;
  imapPort: number;
  imapSecure: boolean;
  verifyOnly?: boolean;
}

interface WithConnectionActionParams {
  mailboxId?: number | null;
  client: ImapFlow;
  settings: MailboxSettingsImapflow;
}
interface WithConnectionErrorParams {
  mailboxId?: number | null;
  error: unknown;
}
interface WithConnectionParam<R> {
  email: string;
  verifyOnly?: boolean;
  action: (params: WithConnectionActionParams) => Promise<R>;
  error?: (params: WithConnectionErrorParams) => Promise<R | null>;
}
interface WithConnectionParamMailbox<R> extends WithConnectionParam<R> {
  accountId: number;
  mailboxId: number;
}

interface WithConnectionParamSettings<R> extends WithConnectionParam<R> {
  settings: MailboxSettingsImapflow;
}

interface WithBoxActionParams {
  mailboxId?: number | null;
  client: ImapFlow;
  path: string;
}
interface WithBoxErrorParams {
  mailboxId?: number | null;
  error: Error;
}
interface WithBoxParams<R> {
  mailboxId: number;
  client: ImapFlow;
  path: string;
  action: (params: WithBoxActionParams) => Promise<R>;
  error?: (params: WithBoxErrorParams) => R | null;
}

interface ProcessMessagesResult {
  result: boolean;
  message?: string | null;
  messages?: MailboxSyncMessages;
  syncInfo?: ImapflowSyncInfo[];
}
interface ProcessMessagesInFolderParams extends WithBoxActionParams {
  folderUidNext: number;
  syncUidNext: number;
  syncDate: Date;
}
interface ProcessMessagesInFolderResult {
  result: boolean;
  message?: string | null;
  syncInfo: ImapflowSyncInfo;
  messages?: MailboxSyncMessages | null;
}

interface SendMessageResult {
  message: string;
  uid?: number | null;
}

// eslint-disable-next-line no-control-regex
const cleanString = (str: string) => str?.replace(/[\u0000\f]/g, '')?.trim();
const concatAddress = (addresses: MessageAddressObject[]) =>
  addresses
    .map((a) => `${a.name ? `${a.name} ` : `${a.address}`}${a.name && a.address ? `<${a.address}>` : ''}`)
    .join(', ');

@Injectable()
@MailIntegration(ProviderName)
export class ImapflowService implements MailProvider {
  private readonly logger = new Logger(ImapflowService.name);
  private readonly _config: ImapflowConfig;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(MailboxSettingsImapflow)
    private readonly repository: Repository<MailboxSettingsImapflow>,
    private readonly mailboxService: MailboxService,
    private readonly mailboxFolderService: MailboxFolderService,
    private readonly mailMessageBuilder: MailMessageBuilderService,
  ) {
    this._config = this.configService.get<ImapflowConfig>('imapflow');
  }

  isCapable(capability: MailProviderCapability): boolean {
    if (capability === 'thread') {
      return false;
    }

    return false;
  }

  async create({
    accountId,
    userId,
    dto,
  }: {
    accountId: number;
    userId: number;
    dto: CreateMailboxImapflowDto;
  }): Promise<MailboxImapflow> {
    const mailbox = await this.mailboxService.create({ accountId, userId, dto: { ...dto, provider: ProviderName } });
    let settings = MailboxSettingsImapflow.fromDto({ accountId, mailboxId: mailbox.id, dto: dto.settings });
    const { result, message } = await this.verify({ email: mailbox.email, settings });
    if (result) {
      settings = await this.repository.save(settings);
      return new MailboxImapflow({ mailbox, settings });
    }
    throw new MailConnectionError(message);
  }

  async findOne(filter: FindFilter): Promise<MailboxSettingsImapflow | null> {
    return this.createQb(filter).getOne();
  }

  async findMailbox(filter: FindFilter & { ownerId?: number }): Promise<MailboxImapflow | null> {
    const mailbox = await this.mailboxService.findOne({ ...filter, provider: ProviderName });
    if (mailbox) {
      const settings = await this.findOne(filter);
      return new MailboxImapflow({ mailbox, settings });
    }
    return null;
  }

  async update({
    accountId,
    user,
    mailboxId,
    dto,
  }: {
    accountId: number;
    user: User;
    mailboxId: number;
    dto: UpdateMailboxImapflowDto & { syncInfo?: ImapflowSyncInfo[] };
  }): Promise<MailboxImapflow | null> {
    let mailbox = await this.mailboxService.findOne({ accountId, mailboxId });
    let settings = await this.findOne({ accountId, mailboxId });
    if (!mailbox || !settings) {
      throw NotFoundError.withId(Mailbox, mailboxId);
    }

    if (dto.email || dto.settings) {
      if (dto.settings) settings = settings.update(dto.settings);
      const { result, message } = await this.verify({ email: dto.email ?? mailbox.email, settings });
      if (!result) {
        throw new MailConnectionError(message);
      }
    }

    if (dto.settings) await this.repository.save(settings);

    mailbox = await this.mailboxService.update({ accountId, user, mailboxId, dto });

    return new MailboxImapflow({ mailbox, settings });
  }

  private async updateSyncInfo({
    accountId,
    mailboxId,
    syncInfo,
  }: {
    accountId: number;
    mailboxId: number;
    syncInfo: ImapflowSyncInfo[];
  }) {
    await this.repository.update({ accountId, mailboxId }, { syncInfo });
  }

  async delete({
    accountId,
    user,
    mailboxId,
    softDelete,
  }: {
    accountId: number;
    user: User;
    mailboxId: number;
    softDelete?: boolean;
  }): Promise<void> {
    await this.mailboxService.delete({ accountId, user, mailboxId, softDelete });
  }

  async verify({ email, settings }: { email: string; settings: MailboxSettingsImapflow }): Promise<MailboxSyncResult> {
    return this.withConnection({
      email,
      settings,
      verifyOnly: true,
      action: async () => ({ result: true }) as MailboxSyncResult,
      error: async (params) => this.handleError(params),
    });
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
    return this.withConnection({
      email: mailbox.email,
      accountId: mailbox.accountId,
      mailboxId: mailbox.id,
      action: async (params) => this.processMailbox({ ...params, syncFull, syncDate }),
      error: async (params) => this.handleError(params),
    });
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
    const folder = await this.mailboxFolderService.findOne({
      accountId: message.accountId,
      messageId: message.id,
    });
    if (folder) {
      const content = await this.withConnection({
        email: mailbox.email,
        accountId: mailbox.accountId,
        mailboxId: mailbox.id,
        action: async (params) => {
          return await this.withMailbox({
            mailboxId: mailbox.id,
            client: params.client,
            path: folder.externalId,
            action: async ({ client }) => {
              const [, uid] = this.parseExternalId(message.externalId);
              const partData = await withTimeout(
                client.download(String(uid), payload.attachment || payload.externalId, { uid: true }),
                this._config.partLoadTimeout,
                null,
              );
              if (partData?.content) {
                const { content } = partData;
                const chunks = [];
                for await (const chunk of content) {
                  chunks.push(chunk);
                }
                return Buffer.concat(chunks);
              }

              return null;
            },
            error: () => null as Buffer<ArrayBuffer>,
          });
        },
      });

      if (content) return { mimeType: payload.mimeType, filename: payload.filename, content };
    }

    return null;
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
      const settings = await this.findOne({ accountId, mailboxId: mailbox.id });
      const transporter = nodemailer.createTransport({
        host: settings.smtpServer,
        port: settings.smtpPort,
        secure: settings.smtpSecure,
        auth: {
          user: mailbox.email,
          pass: settings.password,
        },
      });

      const mail = await this.mailMessageBuilder.createNodemailerMessage(
        mailbox.email,
        userName,
        dto,
        replyToMessage,
        attachments,
      );
      const { messageId } = await transporter.sendMail(mail);
      if (messageId) {
        mail.messageId = messageId;
        const sentFolder = await this.mailboxFolderService.findOne({
          accountId,
          mailboxId: mailbox.id,
          type: MailboxFolderType.Sent,
        });
        if (sentFolder) {
          const sentMessage = await this.sendMessage({
            email: mailbox.email,
            settings,
            mail,
            path: sentFolder.externalId,
          });
          if (sentMessage) {
            return this.createExternalMessage({
              id: sentMessage.uid ?? uuidv4(),
              raw: sentMessage.message,
              folderName: sentFolder.externalId,
            });
          }
        }
      }
    } catch (e) {
      const error = e as Error;
      this.logger.error(`SMTP send message error for mailbox ${mailbox.id}: ${error?.message}`, error?.stack);
    }

    return null;
  }

  private createQb(filter: FindFilter) {
    const qb = this.repository
      .createQueryBuilder('msi')
      .where('msi.accountId = :accountId', { accountId: filter.accountId });
    if (filter.mailboxId) {
      qb.andWhere('msi.mailboxId = :mailboxId', { mailboxId: filter.mailboxId });
    }
    return qb;
  }

  private async withConnection<R>(params: WithConnectionParamMailbox<R> | WithConnectionParamSettings<R>): Promise<R> {
    const { email, verifyOnly, action, error } = params;

    let localSettings: MailboxSettingsImapflow;
    if ('settings' in params) {
      localSettings = params.settings;
    } else if ('accountId' in params && 'mailboxId' in params) {
      localSettings = await this.findOne({ accountId: params.accountId, mailboxId: params.mailboxId });
    } else {
      throw new Error('No mailboxId or settings provided');
    }

    const client = this.getClient({ ...localSettings, email, verifyOnly });
    try {
      await client.connect();
      return await action({ mailboxId: localSettings.mailboxId, client, settings: localSettings });
    } catch (e) {
      this.logger.warn(`Connection error for mailbox ${localSettings.mailboxId}. ${e.toString()}`);
      return error ? await error({ mailboxId: localSettings.mailboxId, error: e as Error }) : null;
    } finally {
      if (!verifyOnly) {
        client.logout();
      }
    }
  }

  private getClient({
    email,
    password,
    imapServer,
    imapPort,
    imapSecure,
    verifyOnly = false,
  }: ImapflowConnectionParams): ImapFlow {
    return new ImapFlow({
      host: imapServer,
      port: imapPort,
      secure: imapSecure,
      auth: { user: email, pass: password },
      verifyOnly: verifyOnly,
      logger: this.logger as unknown as ImapFlowLogger,
    });
  }

  private async withMailbox<R>({ mailboxId, client, path, action, error }: WithBoxParams<R>): Promise<R> {
    const lock = await client.getMailboxLock(path);
    try {
      return await action({ mailboxId, client, path });
    } catch (e) {
      this.logger.warn(`Box <${path}> error for mailbox ${mailboxId}. ${e.toString()}`);
      return error ? await error({ mailboxId, error: e as Error }) : null;
    } finally {
      lock.release();
    }
  }

  private async processMailbox({
    mailboxId,
    client,
    settings,
    syncDate,
    syncFull,
  }: WithConnectionActionParams & { syncFull?: boolean | null; syncDate?: Date | null }): Promise<MailboxSyncResult> {
    const root = await client.listTree();
    const folders = await this.processFolders({ client, folders: root.root ? root.folders : [root] });

    const { result, message, messages, syncInfo } = await this.processMessages({
      client,
      mailboxId,
      folders,
      syncInfo: !syncFull && settings.syncInfo ? settings.syncInfo : [],
      syncDate: syncDate,
    });

    if (result) {
      await this.updateSyncInfo({ accountId: settings.accountId, mailboxId, syncInfo });
    }

    return { result, message, folders, messages };
  }

  private async processFolders({
    client,
    folders,
  }: {
    client: ImapFlow;
    folders: ListTreeResponse[];
  }): Promise<MailboxFolderExternal[]> {
    return Promise.all(
      folders.map(async (folder) => {
        const status = await client.status(folder.path, { uidValidity: true, uidNext: true });
        return {
          id: folder.path,
          uidValidity: Number(status?.uidValidity || 0),
          uidNext: Number(status?.uidNext || 0),
          name: folder.name,
          type: detectMailboxFolderType({ specialUse: folder.specialUse }),
          folders: folder.folders?.length ? await this.processFolders({ client, folders: folder.folders }) : undefined,
        };
      }),
    );
  }

  private async processMessages({
    client,
    mailboxId,
    folders,
    syncInfo,
    syncDate,
  }: {
    client: ImapFlow;
    mailboxId: number;
    folders: MailboxFolderExternal[];
    syncInfo: ImapflowSyncInfo[];
    syncDate?: Date;
  }): Promise<ProcessMessagesResult> {
    const messages: MailboxSyncMessages = { added: [], updated: [], deleted: [] };
    const newSyncInfo: ImapflowSyncInfo[] = [];
    for (const folder of folders) {
      const currentSncInfo = syncInfo.find((si) => si.boxName === folder.id);
      const {
        result: folderResult,
        message: folderMessage,
        messages: folderMsgs,
        syncInfo: folderSyncInfo,
      } = await this.withMailbox({
        mailboxId,
        client,
        path: folder.id,
        action: (params) =>
          this.processMessagesInFolder({
            ...params,
            folderUidNext: folder.uidNext,
            syncUidNext: currentSncInfo?.uidnext,
            syncDate,
          }),
        error: (e) => ({ result: false, message: e.error.message }) as ProcessMessagesInFolderResult,
      });
      if (!folderResult) return { result: false, message: folderMessage };
      if (folderMsgs?.added?.length) messages.added.push(...folderMsgs.added);
      if (folderMsgs?.updated?.length) messages.updated.push(...folderMsgs.updated);
      if (folderMsgs?.deleted?.length) messages.deleted.push(...folderMsgs.deleted);
      if (folderSyncInfo) newSyncInfo.push(folderSyncInfo);

      if (folder.folders?.length) {
        const {
          result: subFolderResult,
          message: subFolderMessage,
          messages: subFolderMsgs,
          syncInfo: subFolderSyncInfo,
        } = await this.processMessages({
          client,
          mailboxId,
          folders: folder.folders,
          syncInfo,
          syncDate,
        });
        if (!subFolderResult) return { result: false, message: subFolderMessage };
        if (subFolderMsgs?.added?.length) messages.added.push(...subFolderMsgs.added);
        if (subFolderMsgs?.updated?.length) messages.updated.push(...subFolderMsgs.updated);
        if (subFolderMsgs?.deleted?.length) messages.deleted.push(...subFolderMsgs.deleted);
        if (subFolderSyncInfo?.length) newSyncInfo.push(...subFolderSyncInfo);
      }
    }

    return { result: true, messages, syncInfo: newSyncInfo };
  }

  private async processMessagesInFolder({
    client,
    path,
    folderUidNext,
    syncUidNext,
    syncDate,
  }: ProcessMessagesInFolderParams): Promise<ProcessMessagesInFolderResult> {
    const added: MailMessageExternal[] = [];
    const search: SearchObject = {};
    let uidTo: number | undefined = undefined;
    if (syncUidNext) {
      if (syncUidNext >= folderUidNext) {
        // No new mail in box
        return { result: true, syncInfo: { boxName: path, uidnext: folderUidNext } };
      }
      uidTo = Math.min(syncUidNext + this._config.searchBatchSize, folderUidNext);
      search.uid = `${syncUidNext}:${uidTo}`;
    } else {
      search.since = syncDate ?? DateUtil.now();
    }

    const messages = await withTimeout(
      client.fetchAll(
        search,
        { uid: true, flags: true, bodyStructure: true, envelope: true, size: true, threadId: true, headers: true },
        { uid: true },
      ),
      this._config.searchTimeout,
      [],
    );

    for (const msg of messages) {
      const message = await this.processMessage({ folderName: path, msg, client });
      if (message) added.push(message);
    }

    return { result: true, messages: { added }, syncInfo: { boxName: path, uidnext: uidTo ?? folderUidNext } };
  }

  private async processMessage({
    msg,
    folderName,
    client,
  }: {
    folderName: string;
    msg: FetchMessageObject;
    client: ImapFlow;
  }): Promise<MailMessageExternal | null> {
    const { uid, threadId, envelope, flags, headers, bodyStructure } = msg;
    const parsed = await simpleParser(headers.toString('utf-8'));

    const references = this.getHeaderValue<string[]>(parsed, 'references')
      ?.join(',')
      ?.split(',')
      ?.map((i) => i.trim());
    const entityIdStr = this.getHeaderValue<string>(parsed, HEADER_ENTITY_ID);
    const entityId = entityIdStr ? Number(entityIdStr) : null;
    const { hasAttachment, payloads } = await this.getMessagePayloads({ client, uid, bodyStructure });
    const snippet = this.getMessageSnippet(payloads);

    return {
      id: this.createExternalId({ folderName, id: uid }),
      threadId: threadId,
      messageId: envelope.messageId,
      sentFrom: envelope.from ? { text: concatAddress(envelope.from), values: envelope.from } : null,
      sentTo: envelope.to ? { text: concatAddress(envelope.to), values: envelope.to } : null,
      replyTo: envelope.replyTo ? { text: concatAddress(envelope.replyTo), values: envelope.replyTo } : null,
      cc: envelope.cc ? { text: concatAddress(envelope.cc), values: envelope.cc } : null,
      subject: envelope.subject,
      date: envelope.date,
      inReplyTo: envelope.inReplyTo,
      references: references,
      isSeen: flags.has(`\\Seen`),
      entityId: entityId,
      folders: [folderName],
      snippet: snippet,
      hasAttachment: hasAttachment,
      payloads: payloads,
    };
  }

  private async getMessagePayloads({
    client,
    uid,
    bodyStructure,
  }: {
    client: ImapFlow;
    uid: number;
    bodyStructure: MessageStructureObject;
  }): Promise<{
    hasAttachment: boolean;
    payloads: MailMessagePayloadExternal[];
  }> {
    const flatStructure = this.flattenBodyStructure(bodyStructure);
    const payloads: MailMessagePayloadExternal[] = [];
    let hasAttachment = false;
    for (const part of flatStructure) {
      if (part.type.startsWith('text/')) {
        const content = await this.getTextPartContent({ client, uid, part });
        if (content) {
          payloads.push({
            id: part.id || part.part,
            mimeType: part.type,
            filename: null,
            attachmentId: part.part,
            content: cleanString(content),
            size: part.size,
          });
        }
      } else {
        const dispositionParameters = part.dispositionParameters as unknown as Record<string, string> | null;
        const parameters = part.parameters as unknown as Record<string, string> | null;
        let filename: string | null = null;
        if (dispositionParameters?.['filename']) {
          filename = StringUtil.decodeRFC5987(dispositionParameters['filename']);
        }
        if (!filename && parameters?.['name']) {
          filename = StringUtil.decodeMimeWord(parameters['name']);
        }
        if (filename) {
          hasAttachment = true;
          payloads.push({
            id: part.id || part.part,
            mimeType: part.type,
            filename: filename,
            attachmentId: part.part,
            content: null,
            size: part.size,
          });
        }
      }
    }
    return { hasAttachment, payloads };
  }

  private flattenBodyStructure(bodyStructure: MessageStructureObject): MessageStructureObject[] {
    return bodyStructure.childNodes
      ? [bodyStructure, ...bodyStructure.childNodes.flatMap((child) => this.flattenBodyStructure(child))]
      : [bodyStructure];
  }

  private async getTextPartContent({
    client,
    uid,
    part,
  }: {
    client: ImapFlow;
    uid: number;
    part: MessageStructureObject;
  }): Promise<string | null> {
    const partData = await withTimeout(
      client.download(`${uid}`, part.part || '1', { uid: true }),
      this._config.partLoadTimeout,
      null,
    );
    if (partData) {
      const { content, meta } = partData;
      const chunks = [];
      for await (const chunk of content) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const decodedBuffer = this.decodeBuffer({ buffer, encoding: part.encoding });
      return iconv.decode(decodedBuffer, meta.charset || 'utf-8');
    }

    return null;
  }

  private decodeBuffer({ encoding, buffer }: { encoding: string; buffer: Buffer<ArrayBuffer> }): Buffer<ArrayBuffer> {
    switch (encoding.toUpperCase()) {
      case 'BASE64':
        return buffer;
      case 'QUOTED-PRINTABLE':
        return Buffer.from(quotedPrintable.decode(buffer.toString()));
      case '7BIT':
      case '8BIT':
      case 'BINARY':
      default:
        return buffer;
    }
  }

  private getMessageSnippet(payloads: MailMessagePayloadExternal[]): string {
    const plain = payloads.find((p) => p.mimeType === 'text/plain');
    if (plain && plain.content) {
      return plain.content.trim().substring(0, 150).trim();
    }

    const html = payloads.find((p) => p.mimeType === 'text/html');
    if (html && html.content) {
      return convert(html.content)?.trim()?.substring(0, 150)?.trim();
    }

    return '';
  }

  private async handleError({ error }: WithConnectionErrorParams): Promise<MailboxSyncResult> {
    return { result: false, message: error['responseText'] };
  }

  private getHeaderValue<T>(parsed: ParsedMail, key: string): T | null {
    return parsed.headers.has(key) ? (parsed.headers.get(key) as T) : null;
  }

  private createExternalId({ folderName, id }: { folderName: string; id: number | string }): string {
    return `${folderName}-${id}`;
  }

  private parseExternalId(externalId: string): [string, number] {
    const lastDashIndex = externalId.lastIndexOf('-');
    if (lastDashIndex === -1) {
      throw new Error(`Invalid externalId format: ${externalId}`);
    }
    const folderName = externalId.substring(0, lastDashIndex);
    const idStr = externalId.substring(lastDashIndex + 1);
    const id = Number(idStr);
    if (isNaN(id)) {
      throw new Error(`Invalid message ID in externalId: ${externalId}`);
    }
    return [folderName, id];
  }

  private async sendMessage({
    email,
    settings,
    mail,
    path,
  }: {
    email: string;
    settings: MailboxSettingsImapflow;
    mail: Mail.Options;
    path: string;
  }): Promise<SendMessageResult> {
    return this.withConnection({
      email: email,
      settings,
      action: async ({ client }) => {
        const message = await this.mailMessageBuilder.createRawMessage(mail, 'utf-8');
        const result = await client.append(path, message, ['\\Seen']);
        return { message, uid: result?.uid };
      },
      error: async () => null as SendMessageResult,
    });
  }

  private async createExternalMessage({
    id,
    raw,
    folderName,
    isSeen = true,
  }: {
    id: number | string;
    raw: Source;
    folderName: string;
    isSeen?: boolean;
  }): Promise<MailMessageExternal | null> {
    const parsed = await simpleParser(raw);
    if (!parsed) {
      return null;
    }

    const { from, to, replyTo, cc, subject, date, messageId, inReplyTo, references, text, html, attachments, headers } =
      parsed;
    const messageDate = date ?? DateUtil.now();
    const snippet = text ? text.substring(0, 150).trim() : '';
    const entityId: number | null = headers.has(HEADER_ENTITY_ID)
      ? parseInt(headers.get(HEADER_ENTITY_ID) as string)
      : null;
    const payloads = this.formatAsExternalPayload(text, html, attachments);
    return {
      id: this.createExternalId({ folderName, id }),
      threadId: null,
      snippet,
      sentFrom: this.convertAddress(from),
      sentTo: this.convertAddress(to),
      replyTo: this.convertAddress(replyTo),
      cc: this.convertAddress(cc),
      subject,
      date: messageDate,
      hasAttachment: attachments && attachments.length > 0,
      messageId,
      inReplyTo: inReplyTo,
      references: typeof references === 'string' ? [references] : references,
      isSeen,
      entityId,
      folders: [folderName],
      payloads,
    };
  }

  private convertAddress(addresses: AddressObject | AddressObject[] | null | undefined): EmailAddress | null {
    if (!addresses) {
      return null;
    }

    if (Array.isArray(addresses)) {
      const texts: string[] = [];
      const values: EmailAddressValue[] = [];
      for (const address of addresses) {
        if (address) {
          texts.push(address.text);
          values.push(...address.value.filter((v) => v?.address).map((v) => ({ address: v.address, name: v.name })));
        }
      }
      return { text: texts.join(', '), values };
    }

    return {
      text: addresses.text,
      values: addresses.value.filter((v) => v?.address).map((v) => ({ address: v.address, name: v.name })),
    };
  }

  private formatAsExternalPayload(
    text: string,
    html: string | boolean,
    attachments: object[],
  ): MailMessagePayloadExternal[] {
    const payloads: MailMessagePayloadExternal[] = [];
    if (text && text.trim()) {
      payloads.push({
        id: null,
        mimeType: 'text/plain',
        filename: null,
        attachmentId: null,
        content: text,
        size: text.length,
      });
    }
    if (html && typeof html === 'string') {
      payloads.push({
        id: null,
        mimeType: 'text/html',
        filename: null,
        attachmentId: null,
        content: html.trim(),
        size: html.trim().length,
      });
    }
    if (attachments && attachments.length > 0) {
      attachments.forEach((a) =>
        payloads.push({
          id: a['partId'],
          mimeType: a['contentType'],
          filename: a['filename'],
          attachmentId: a['id'],
          content: null,
          size: a['size'],
        }),
      );
    }
    return payloads;
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
      return this.changeFlags(mailbox, messages, ['\\Seen'], seen ? 'add' : 'del');
    } else {
      throw new NotImplementedException();
    }
  }
  private async changeFlags(
    mailbox: Mailbox,
    groupedMessages: FolderMessages[],
    flags: string[],
    action: 'add' | 'del',
  ): Promise<boolean> {
    return this.withConnection({
      accountId: mailbox.accountId,
      email: mailbox.email,
      mailboxId: mailbox.id,
      action: async ({ client }) => {
        for (const { folderId, messageIds } of groupedMessages) {
          const parsedIds = messageIds.map((m) => this.parseExternalId(m)[1]);
          await this.withMailbox({
            mailboxId: mailbox.id,
            client,
            path: folderId,
            action: async ({ client }) => {
              switch (action) {
                case 'add':
                  await client.messageFlagsAdd(parsedIds, flags, { uid: true });
                  break;
                case 'del':
                  await client.messageFlagsRemove(parsedIds, flags, { uid: true });
                  break;
              }
            },
          });
        }
        return true;
      },
      error: async () => {
        return false;
      },
    });
  }

  async trash({
    mailbox,
    messages,
  }: {
    mailbox: Mailbox;
    messages: { threadId: string } | FolderMessages[];
  }): Promise<boolean> {
    if (Array.isArray(messages)) {
      return this.moveMessages(mailbox, messages, MailboxFolderType.Trash);
    } else {
      throw new NotImplementedException();
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
      return this.moveMessages(mailbox, messages, MailboxFolderType.Inbox);
    } else {
      throw new NotImplementedException();
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
      return this.moveMessages(mailbox, messages, MailboxFolderType.Junk);
    } else {
      throw new NotImplementedException();
    }
  }
  async unspam({
    mailbox,
    messages,
  }: {
    mailbox: Mailbox;
    messages: { threadId: string } | FolderMessages[];
  }): Promise<boolean> {
    if (Array.isArray(messages)) {
      return this.moveMessages(mailbox, messages, MailboxFolderType.Inbox);
    } else {
      throw new NotImplementedException();
    }
  }

  private async moveMessages(
    mailbox: Mailbox,
    groupedMessages: FolderMessages[],
    type: MailboxFolderType,
  ): Promise<boolean> {
    return this.withConnection({
      accountId: mailbox.accountId,
      email: mailbox.email,
      mailboxId: mailbox.id,
      action: async ({ client }) => {
        const toFolder = await this.mailboxFolderService.findOne({
          accountId: mailbox.accountId,
          mailboxId: mailbox.id,
          type,
        });
        if (toFolder) {
          for (const { folderId, messageIds } of groupedMessages) {
            const parsedIds = messageIds.map((m) => this.parseExternalId(m)[1]);
            await this.withMailbox({
              mailboxId: mailbox.id,
              client,
              path: folderId,
              action: async ({ client }) => {
                await client.messageMove(parsedIds, toFolder.externalId, { uid: true });
              },
            });
          }
        }
        return true;
      },
      error: async () => {
        return false;
      },
    });
  }
}
