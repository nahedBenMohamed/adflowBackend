import { forwardRef, Inject, Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { connect, getParts, ImapSimple, Message } from 'imap-simple';
import * as Imap from 'imap';
import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import addressparser from 'nodemailer/lib/addressparser';
import { AddressObject, simpleParser, Source } from 'mailparser';
import { v4 as uuidv4 } from 'uuid';
import { convert } from 'html-to-text';

import { capitalizeFirst, DateUtil, StringUtil, withTimeout } from '@/common';
import { StorageFile } from '@/modules/storage/types/storage-file';

import { MailConfig } from '../../config';
import {
  detectMailboxFolderType,
  EmailAddress,
  EmailAddressValue,
  FolderMessages,
  ImapSyncInfo,
  MailboxFolderExternal,
  MailboxFolderType,
  MailboxSyncResult,
  MailMessageAttachment,
  MailMessageExternal,
  MailMessagePayloadExternal,
  SendMailMessageDto,
} from '../../common';
import { Mailbox } from '../../mailbox/entities';
import { MailboxFolderService } from '../../mailbox-folder';
import { MailIntegration, MailProvider, MailProviderCapability } from '../../mail-provider';
import { MailMessagePayload } from '../../mail-message-payload';
import { HEADER_ENTITY_ID, MailMessageBuilderService } from '../../mail-message-builder';

import { MailboxSettingsManual } from '../../Model/MailboxManual/MailboxSettingsManual';
import { MailMessage } from '../../Model/MailMessage/MailMessage';

import { MailMessageService } from '../MailMessage/MailMessageService';

import { MailboxSettingsManualDto } from './Dto/MailboxSettingsManualDto';
import { UpdateMailboxSettingsManualDto } from './Dto/UpdateMailboxSettingsManualDto';

// eslint-disable-next-line no-control-regex
const cleanString = (str: string) => str?.replace(/[\u0000\f]/g, '')?.trim();

const ProviderName = 'manual';

@Injectable()
@MailIntegration(ProviderName)
export class MailboxManualService implements MailProvider {
  private readonly logger = new Logger(MailboxManualService.name);
  private readonly _config: MailConfig;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(MailboxSettingsManual)
    private readonly repository: Repository<MailboxSettingsManual>,
    private readonly mailboxFolderService: MailboxFolderService,
    @Inject(forwardRef(() => MailMessageService))
    private readonly mailMessageService: MailMessageService,
    private readonly mailMessageBuilder: MailMessageBuilderService,
  ) {
    this._config = this.configService.get<MailConfig>('mail');
  }

  isCapable(capability: MailProviderCapability): boolean {
    if (capability === 'thread') {
      return false;
    }

    return false;
  }

  async getManualSettings(accountId: number, mailboxId: number): Promise<MailboxSettingsManualDto> {
    const settings = await this.repository.findOneBy({ accountId, mailboxId });
    if (!settings) {
      return MailboxSettingsManualDto.createDefault();
    }
    return MailboxSettingsManualDto.create(settings);
  }

  async saveManualSettings(
    accountId: number,
    mailboxId: number,
    dto: UpdateMailboxSettingsManualDto,
  ): Promise<{ result: boolean; state: MailboxSettingsManualDto | string }> {
    let settings = await this.repository.findOneBy({ accountId, mailboxId });
    settings = settings ? settings.update(dto) : MailboxSettingsManual.create(mailboxId, accountId, dto);
    const { result, message } = await this.checkSettings(dto.email, settings);
    if (result) {
      await this.repository.save(settings);
      return { result, state: MailboxSettingsManualDto.create(settings) };
    } else {
      return { result, state: message };
    }
  }

  private async withConnection<R, E>({
    email,
    mailboxId,
    settings,
    action,
    onError,
  }: {
    email: string;
    mailboxId?: number;
    settings?: MailboxSettingsManual;
    action: (connection: ImapSimple, settings: MailboxSettingsManual) => Promise<R>;
    onError?: (error: unknown) => E;
  }) {
    if (!mailboxId && !settings) {
      throw new Error('No mailboxId or settings provided');
    }
    const localSettings = settings ?? (await this.repository.findOneBy({ mailboxId }));
    let connection: ImapSimple;
    try {
      connection = await connect(this.getSimpleImapConfig(email, localSettings));
      // connection.on('error', (error) => {
      //   this.logger.error(`Connection onError for mailbox ${localSettings.mailboxId}`, error.stack);
      // });
      return await action(connection, localSettings);
    } catch (e) {
      this.logger.warn(`Connection error for mailbox ${localSettings.mailboxId}. ${e.toString()}`);
      return onError ? onError(e as Error) : null;
    } finally {
      connection?.end();
    }
  }

  private getSimpleImapConfig(user: string, settings: MailboxSettingsManual) {
    return {
      imap: {
        user: user,
        password: settings.password,
        host: settings.imapServer,
        port: settings.imapPort,
        tls: settings.imapSecure,
        tlsOptions: { servername: settings.imapServer },
        authTimeout: 3000,
      },
    };
  }

  private async withBox<R, E>({
    mailboxId,
    connection,
    boxName,
    autoExpunge,
    action,
    onError,
  }: {
    mailboxId: number;
    connection: ImapSimple;
    boxName: string;
    autoExpunge: boolean;
    action: (box: Imap.Box) => Promise<R>;
    onError?: (error: unknown) => E;
  }) {
    let box: Imap.Box;
    try {
      box = (await connection.openBox(boxName)) as unknown as Imap.Box;
      return await action(box);
    } catch (e) {
      this.logger.warn(`Box <${boxName}> error for mailbox ${mailboxId}. ${e.toString()}`);
      return onError ? onError(e) : null;
    } finally {
      try {
        await connection.closeBox(autoExpunge);
      } catch (closeError) {
        this.logger.warn(`Failed to close box <${boxName}> for mailbox ${mailboxId}. ${closeError.toString()}`);
      }
    }
  }

  private async checkSettings(email: string, settings: MailboxSettingsManual): Promise<MailboxSyncResult> {
    return await this.withConnection({
      email,
      settings,
      action: async () => {
        return { result: true, message: null };
      },
      onError: (error) => {
        return { result: false, message: (error as Error)?.message };
      },
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
    return syncFull ? this.syncFull(mailbox, syncDate) : this.syncPartial(mailbox);
  }

  async syncFull(mailbox: Mailbox, syncDate: Date | null): Promise<MailboxSyncResult> {
    return await this.withConnection({
      mailboxId: mailbox.id,
      email: mailbox.email,
      action: async (connection) => {
        const syncInfo = await this.processMailbox({
          connection,
          mailbox,
          syncInfo: [],
          fromDate: syncDate ?? DateUtil.now(),
        });
        await this.repository.update(mailbox.id, { imapSync: syncInfo });
        return { result: true, message: null };
      },
      onError: (error) => {
        return { result: false, message: (error as Error)?.message };
      },
    });
  }

  async syncPartial(mailbox: Mailbox): Promise<MailboxSyncResult> {
    return await this.withConnection({
      mailboxId: mailbox.id,
      email: mailbox.email,
      action: async (connection, settings) => {
        const syncInfo = await this.processMailbox({
          connection,
          mailbox,
          syncInfo: settings.imapSync ?? [],
          fromDate: DateUtil.now(),
        });
        await this.repository.update(mailbox.id, { imapSync: syncInfo });
        return { result: true, message: null };
      },
      onError: (error) => {
        return { result: false, message: (error as Error)?.message };
      },
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
    const content: Uint8Array | null = await this.withConnection({
      mailboxId: mailbox.id,
      email: mailbox.email,
      action: async (connection) => {
        const folders = await this.mailboxFolderService.findMany({
          accountId: message.accountId,
          messageId: message.id,
        });
        if (folders && folders.length > 0) {
          return await this.withBox({
            mailboxId: mailbox.id,
            connection,
            boxName: folders[0].externalId,
            autoExpunge: false,
            action: async () => {
              const uid = this.parseMessageId(message.externalId);
              const mails = await connection.search(['ALL', ['UID', `${uid}`]], { bodies: ['HEADER'], struct: true });
              let data = null;
              if (mails && mails.length > 0) {
                const parts = getParts(mails[0].attributes.struct);
                const part = parts.find((p) => p.partID === payload.externalId);
                if (part) {
                  data = await connection.getPartData(mails[0], part);
                }
              }
              return data ? new Uint8Array(data) : null;
            },
            onError: () => {
              return null;
            },
          });
        } else {
          return null;
        }
      },
    });

    return content ? { mimeType: payload.mimeType, filename: payload.filename, content } : null;
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
        const appended = await this.appendToFolder(accountId, mailbox, settings, MailboxFolderType.Sent, mail);
        if (appended) {
          return await this.createExternalMessage(uuidv4(), appended.message, appended.folderExternalId, true);
        }
      }
    } catch (e) {
      const error = e as Error;
      this.logger.error(`SMTP send message error for mailbox ${mailbox.id}: ${error?.message}`, error?.stack);
    }

    return null;
  }

  private async processMailbox({
    connection,
    mailbox,
    syncInfo,
    fromDate,
  }: {
    connection: ImapSimple;
    mailbox: Mailbox;
    syncInfo: ImapSyncInfo[];
    fromDate: Date;
  }): Promise<ImapSyncInfo[]> {
    const sync: ImapSyncInfo[] = [];
    const boxes = await connection.getBoxes();
    const boxesNames = Object.getOwnPropertyNames(boxes);
    const folders: MailboxFolderExternal[] = [];
    const messages: MailMessageExternal[] = [];

    for (const boxName of boxesNames) {
      await this.withBox({
        mailboxId: mailbox.id,
        connection,
        boxName,
        autoExpunge: true,
        action: async (box) => {
          folders.push(this.convertToExternalFolder(box));
          const search: unknown[] = ['ALL'];
          let uidTo: number | undefined = undefined;
          const boxSyncInfo = syncInfo.find((si) => si.boxName === box.name);
          if (boxSyncInfo) {
            if (boxSyncInfo.uidnext >= box.uidnext) {
              // No new mail in box
              sync.push({ boxName: box.name, uidnext: box.uidnext });
              return;
            }
            uidTo = Math.min(boxSyncInfo.uidnext + this._config.manual.searchBatchSize, box.uidnext);
            search.push(['UID', `${boxSyncInfo.uidnext}:${uidTo}`]);
          } else {
            search.push(['SINCE', fromDate]);
          }
          const mails = await withTimeout(
            connection.search(search, { size: true, struct: true, bodies: ['HEADER'] }),
            this._config.manual.searchTimeout,
            [],
          );
          for (const mail of mails) {
            if (!boxSyncInfo || boxSyncInfo.uidnext <= mail.attributes.uid) {
              const message = await this.processMessage({ connection, folderName: box.name, message: mail });
              if (message) messages.push(message);
            }
          }
          sync.push({ boxName: box.name, uidnext: Math.min((uidTo ?? 0) + 1, box.uidnext) });
        },
      });
    }

    await this.mailboxFolderService.processExternal({
      accountId: mailbox.accountId,
      mailboxId: mailbox.id,
      extFolders: folders,
    });
    await this.mailMessageService.processExternalMessages({ accountId: mailbox.accountId, mailbox, added: messages });

    return sync;
  }

  private async processMessage({
    connection,
    folderName,
    message,
  }: {
    connection: ImapSimple;
    folderName: string;
    message: Message;
  }): Promise<MailMessageExternal | null> {
    const header = message.parts.find((p) => p.which === 'HEADER');
    if (!header || !header.body) return null;

    const from = cleanString((header.body['from'] as string[])?.join(', '));
    const to = cleanString((header.body['to'] as string[])?.join(', '));
    const replyTo = cleanString((header.body['reply-to'] as string[])?.join(', '));
    const cc = cleanString((header.body['cc'] as string[])?.join(', '));
    const subject = cleanString((header.body['subject'] as string[])?.join(', '));
    let date = new Date(header.body['date']?.[0] as string);
    if (!date || isNaN(date.getTime())) {
      date = new Date();
    }
    const messageId = header.body['message-id']?.[0] as string;
    const inReplyTo = header.body['in-reply-to']?.[0] as string;
    const references = (header.body['references'] as string[])
      ?.join(',')
      ?.split(',')
      ?.map((i) => i.trim());
    const isSeen = message.attributes.flags.includes(`\\Seen`);
    const entityId = header.body[HEADER_ENTITY_ID] ? parseInt(header.body[HEADER_ENTITY_ID][0] as string) : null;

    const parts = getParts(message.attributes.struct);
    const { hasAttachment, payloads } = await this.getMessagePayloads({ connection, message, parts });
    const snippet = this.getMessageSnippet(payloads);

    return {
      id: this.formatExternalId(folderName, message.attributes.uid),
      threadId: null,
      snippet: snippet,
      sentFrom: { text: from, values: addressparser(from, { flatten: true }) },
      sentTo: to ? { text: to, values: addressparser(to, { flatten: true }) } : null,
      replyTo: replyTo ? { text: replyTo, values: addressparser(replyTo, { flatten: true }) } : null,
      cc: cc ? { text: cc, values: addressparser(cc, { flatten: true }) } : null,
      subject: subject,
      date: date,
      hasAttachment: hasAttachment,
      messageId: messageId,
      inReplyTo: inReplyTo,
      references: references,
      isSeen: isSeen,
      entityId: entityId,
      folders: [folderName],
      payloads: payloads,
    };
  }

  private async getMessagePayloads({
    connection,
    message,
    parts,
  }: {
    connection: ImapSimple;
    message: Message;
    parts: any[];
  }): Promise<{
    hasAttachment: boolean;
    payloads: MailMessagePayloadExternal[];
  }> {
    let hasAttachment = false;
    const payloads: MailMessagePayloadExternal[] = [];
    for (const part of parts) {
      hasAttachment ||= part.type !== 'text';
      const mimeType = `${part.type}/${part.subtype}`;
      if (part.type === 'text') {
        const partData = part.size
          ? await withTimeout(connection.getPartData(message, part), this._config.manual.partLoadTimeout, null)
          : null;
        const content = partData ? cleanString(partData.toString()) : null;
        payloads.push({ id: part.partID, mimeType, filename: null, attachmentId: part.id, content, size: part.size });
      } else {
        let fileName = null;
        if (part.params?.name) {
          fileName = StringUtil.decodeMimeWord(part.params.name);
        }
        if (!fileName && part.disposition?.params?.filename) {
          fileName = StringUtil.decodeRFC5987(part.disposition.params.filename);
        }
        payloads.push({
          id: part.partID,
          mimeType,
          filename: fileName,
          attachmentId: part.id,
          content: null,
          size: part.size,
        });
      }
    }

    return { hasAttachment, payloads };
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

  private convertToExternalFolder(box: Imap.Box): MailboxFolderExternal {
    return {
      id: box.name,
      name: capitalizeFirst(box.name),
      uidValidity: box.uidvalidity,
      type: detectMailboxFolderType({ name: box.name }),
    };
  }

  private async createExternalMessage(
    id: number | string,
    raw: Source,
    boxName: string,
    isSeen: boolean,
  ): Promise<MailMessageExternal | null> {
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
      id: this.formatExternalId(boxName, id),
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
      folders: [boxName],
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
    attachments: any[],
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
          id: a.partId,
          mimeType: a.contentType,
          filename: a.filename,
          attachmentId: a.id,
          content: null,
          size: a.size,
        }),
      );
    }
    return payloads;
  }

  private formatExternalId(boxName: string, id: number | string): string {
    return `${boxName}-${id}`;
  }
  private parseMessageId(externalId: string): number {
    return Number(externalId.slice(externalId.lastIndexOf('-') + 1));
  }

  private async appendToFolder(
    accountId: number,
    mailbox: Mailbox,
    settings: MailboxSettingsManual,
    type: MailboxFolderType,
    mail: Mail.Options,
  ): Promise<{ message: string; folderExternalId: string } | null> {
    return await this.withConnection({
      email: mailbox.email,
      settings: settings,
      action: async (connection) => {
        const folder = await this.mailboxFolderService.findOne({ accountId, mailboxId: mailbox.id, type });
        if (folder) {
          const message = await this.mailMessageBuilder.createRawMessage(mail, 'utf-8');
          connection.append(message, { mailbox: folder.externalId });
          return { message, folderExternalId: folder.externalId };
        }
        return null;
      },
    });
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
    return await this.withConnection({
      email: mailbox.email,
      mailboxId: mailbox.id,
      action: async (connection) => {
        for (const { folderId, messageIds } of groupedMessages) {
          await this.withBox({
            mailboxId: mailbox.id,
            connection,
            boxName: folderId,
            autoExpunge: true,
            action: async () => {
              const parsedIds = messageIds.map((m) => this.parseMessageId(m));
              switch (action) {
                case 'add':
                  await connection.addFlags(parsedIds, flags);
                  break;
                case 'del':
                  await connection.delFlags(parsedIds, flags);
                  break;
              }
            },
          });
        }
        return true;
      },
      onError: () => {
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
      return this.moveMessages(mailbox.accountId, mailbox, messages, MailboxFolderType.Trash);
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
      return this.moveMessages(mailbox.accountId, mailbox, messages, MailboxFolderType.Inbox);
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
      return this.moveMessages(mailbox.accountId, mailbox, messages, MailboxFolderType.Junk);
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
      return this.moveMessages(mailbox.accountId, mailbox, messages, MailboxFolderType.Inbox);
    } else {
      throw new NotImplementedException();
    }
  }

  private async moveMessages(
    accountId: number,
    mailbox: Mailbox,
    groupedMessages: FolderMessages[],
    type: MailboxFolderType,
  ): Promise<boolean> {
    return await this.withConnection({
      email: mailbox.email,
      mailboxId: mailbox.id,
      action: async (connection) => {
        const toFolder = await this.mailboxFolderService.findOne({ accountId, mailboxId: mailbox.id, type });
        if (toFolder) {
          for (const { folderId, messageIds } of groupedMessages) {
            const parsedIds = messageIds.map((m) => this.parseMessageId(m).toString());
            await this.withBox({
              mailboxId: mailbox.id,
              connection,
              boxName: folderId,
              autoExpunge: true,
              action: async () => {
                await connection.moveMessage(parsedIds, toFolder.externalId);
              },
            });
          }
        }
        return true;
      },
      onError: () => {
        return false;
      },
    });
  }
}
