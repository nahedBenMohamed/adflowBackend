import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Brackets, In, Repository, WhereExpressionBuilder } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import addressparser from 'nodemailer/lib/addressparser';

import { PagingMeta, NotFoundError } from '@/common';

import { UserService } from '@/modules/iam/user/user.service';
import { User } from '@/modules/iam/user/entities/user.entity';
import { EntityInfoService } from '@/modules/entity/entity-info/entity-info.service';
import { EntityInfoDto } from '@/modules/entity/entity-info/dto/entity-info.dto';
import { FieldType } from '@/modules/entity/entity-field/common/enums/field-type.enum';
import { EntityService } from '@/CRM/Service/Entity/EntityService';
import { Entity } from '@/CRM/Model/Entity/Entity';

import {
  EmailAddressValue,
  FolderMessages,
  MailboxFolderType,
  MailboxState,
  MailEventType,
  MailMessageAttachment,
  MailMessageEvent,
  MailMessageExternal,
  MailMessageReceivedEvent,
} from '../../common';
import { Mailbox } from '../../mailbox/entities';
import { MailboxService } from '../../mailbox/services';
import { MailboxFolder, MailboxFolderService } from '../../mailbox-folder';
import { MailMessagePayloadService } from '../../mail-message-payload';

import { MailMessage } from '../../Model/MailMessage/MailMessage';
import { MailMessageFolder } from '../../Model/MailMessage/MailMessageFolder';
import { MailMessageWithFolders } from '../../Model/MailMessage/MailMessageWithFolders';

import { MailThreadInfo } from './MailThreadInfo';
import { MailMessageInfo } from './MailMessageInfo';
import { MailThreadResult } from './MailThreadResult';

import { MailMessageDto } from './Dto/MailMessageDto';
import { CreateContactLeadDto } from './Dto/CreateContactLeadDto';

import { GetSectionMessagesFilter } from '../../Controller/MailMessage/GetSectionMessagesFilter';
import { GetMailboxMessagesFilter } from '../../Controller/MailMessage/GetMailboxMessagesFilter';

@Injectable()
export class MailMessageService {
  constructor(
    private readonly eventEmitter: EventEmitter2,
    @InjectRepository(MailMessage)
    private readonly repository: Repository<MailMessage>,
    @InjectRepository(MailMessageFolder)
    private readonly repositoryFolderLink: Repository<MailMessageFolder>,
    @Inject(forwardRef(() => MailboxService))
    private readonly mailboxService: MailboxService,
    private readonly mailboxFolderService: MailboxFolderService,
    private readonly mailMessagePayloadService: MailMessagePayloadService,
    private readonly userService: UserService,
    private readonly entityService: EntityService,
    private readonly entityInfoService: EntityInfoService,
  ) {}

  async getById(accountId: number, mailboxId: number, messageId: number): Promise<MailMessage> {
    const message = await this.findById(accountId, mailboxId, messageId);
    if (!message) {
      throw NotFoundError.withId(MailMessage, messageId);
    }
    return message;
  }

  async findById(accountId: number, mailboxId: number, messageId: number): Promise<MailMessage | null> {
    return this.repository.findOneBy({ accountId, mailboxId, id: messageId });
  }

  async getByThreadIdGroupByFolder(accountId: number, mailboxId: number, threadId: string): Promise<FolderMessages[]> {
    const links = await this.repository
      .createQueryBuilder('mm')
      .select('mm.external_id', 'messageId')
      .addSelect('mf.external_id', 'folderId')
      .leftJoin('mail_message_folder', 'mmf', 'mmf.message_id = mm.id')
      .leftJoin('mailbox_folder', 'mf', 'mf.id = mmf.folder_id')
      .where('mm.account_id = :accountId', { accountId })
      .andWhere('mm.mailbox_id = :mailboxId', { mailboxId })
      .andWhere('mm.thread_id = :threadId', { threadId })
      .getRawMany<{ messageId: string; folderId: string }>();

    const groupByFolder: FolderMessages[] = links.reduce((groups, link) => {
      let group = groups.find((g) => g.folderId === link.folderId);
      if (!group) {
        group = { folderId: link.folderId, messageIds: [] };
        groups.push(group);
      }
      group.messageIds.push(link.messageId);
      return groups;
    }, [] as FolderMessages[]);

    return groupByFolder;
  }

  async getMessagesForMailbox(
    accountId: number,
    user: User,
    mailboxId: number,
    filter: GetMailboxMessagesFilter,
  ): Promise<MailThreadResult> {
    const { folderId, search, skip, take } = filter;
    const mailbox = await this.mailboxService.findOne({ accountId, mailboxId, accessibleUserId: user.id });

    if (!mailbox) {
      return new MailThreadResult([], PagingMeta.empty());
    }

    const threadsQuery = this.repository
      .createQueryBuilder('message')
      .select('message.thread_id', 'threadId')
      .where('message.account_id = :accountId', { accountId })
      .andWhere('message.mailbox_id = :mailboxId', { mailboxId: mailbox.id });
    if (folderId) {
      threadsQuery
        .leftJoin(MailMessageFolder, 'mmf', 'mmf.message_id = message.id')
        .andWhere('mmf.folder_id = :folderId', { folderId });
    }
    if (search) {
      threadsQuery.andWhere(new Brackets((qb) => this.createSearchQuery(qb, search)));
    }

    const { count } = await threadsQuery.clone().select('COUNT(DISTINCT(message.thread_id))').getRawOne();
    const threads = await threadsQuery
      .groupBy('message.thread_id')
      .orderBy('MAX(message.date)', 'DESC')
      .offset(skip)
      .limit(take)
      .getRawMany();

    const threadInfos = await this.getMessagesForThreads(
      accountId,
      user,
      [mailbox.id],
      threads.map((thread) => thread.threadId),
    );

    return new MailThreadResult(threadInfos, new PagingMeta(skip + threads.length, Number(count)));
  }

  async getMessagesForSection(
    accountId: number,
    user: User,
    type: MailboxFolderType,
    filter: GetSectionMessagesFilter,
  ): Promise<MailThreadResult> {
    const { mailboxId, search, skip, take } = filter;

    const mailboxes = await this.mailboxService.findMany({ accountId, mailboxId, accessibleUserId: user.id });

    const mailboxesIds = mailboxes
      .filter((mailbox) => mailbox.state !== MailboxState.Deleted)
      .map((mailbox) => mailbox.id);

    if (mailboxesIds.length === 0) {
      return new MailThreadResult([], PagingMeta.empty());
    }

    const threadsQuery = this.repository
      .createQueryBuilder('message')
      .select('message.thread_id', 'threadId')
      .leftJoin(MailMessageFolder, 'mmf', 'mmf.message_id = message.id')
      .leftJoin(MailboxFolder, 'folder', 'folder.id = mmf.folder_id')
      .where('message.account_id = :accountId', { accountId })
      .andWhere('message.mailbox_id IN (:...mailboxIds)', { mailboxIds: mailboxesIds })
      .andWhere('folder.type = :type', { type });
    if (search) {
      threadsQuery.andWhere(new Brackets((qb) => this.createSearchQuery(qb, search)));
    }

    const { count } = await threadsQuery.clone().select('COUNT(DISTINCT(message.thread_id))').getRawOne();
    const threads = await threadsQuery
      .groupBy('message.thread_id')
      .orderBy('MAX(message.date)', 'DESC')
      .offset(skip)
      .limit(take)
      .getRawMany();

    const threadInfos = await this.getMessagesForThreads(
      accountId,
      user,
      mailboxesIds,
      threads.map((thread) => thread.threadId),
    );

    return new MailThreadResult(threadInfos, new PagingMeta(skip + threads.length, Number(count)));
  }

  private createSearchQuery(qb: WhereExpressionBuilder, search: string): void {
    qb.where(`message.sent_from ilike '%${search}%'`)
      .orWhere(`message.sent_to ilike '%${search}%'`)
      .orWhere(`message.cc ilike '%${search}%'`)
      .orWhere(`message.subject ilike '%${search}%'`)
      .orWhere(`message.snippet ilike '%${search}%'`);
  }

  async getThreadForMessageId(accountId: number, user: User, messageId: number): Promise<MailThreadInfo> {
    const message = await this.repository.findOneBy({ accountId, id: messageId });
    if (message) {
      const threads = await this.getMessagesForThreads(accountId, user, [message.mailboxId], [message.threadId]);

      return threads?.length ? threads[0] : null;
    }

    return null;
  }

  private async getMessagesForThreads(
    accountId: number,
    user: User,
    mailboxIds: number[],
    threadIds: string[],
  ): Promise<MailThreadInfo[]> {
    const messages = await this.repository.find({
      where: { accountId, mailboxId: In(mailboxIds), threadId: In(threadIds) },
      order: { date: 'DESC' },
    });

    const messagesWithFolders: MailMessageWithFolders[] = [];
    for (const msg of messages) {
      const folders = await this.mailboxFolderService.findMany({ accountId, messageId: msg.id });
      messagesWithFolders.push(new MailMessageWithFolders(msg, folders));
    }

    const entityInfoCache: EntityInfoDto[] = [];
    const threads: MailThreadInfo[] = [];
    for (const threadId of threadIds) {
      const messages: MailMessageInfo[] = [];
      const threadMessages = messagesWithFolders.filter((mwf) => mwf.message.threadId === threadId);
      for (const tm of threadMessages) {
        const entityInfo = tm.message.entityId
          ? await this.getEntityInfoCached(accountId, user, tm.message.entityId, entityInfoCache)
          : null;
        messages.push(
          MailMessageInfo.create(
            tm.message,
            tm.folders.map((f) => f.name),
            entityInfo,
          ),
        );
      }
      threads.push(new MailThreadInfo(threadId, messages));
    }
    return threads;
  }

  private async getEntityInfoCached(accountId: number, user: User, entityId: number, entityInfoCache: EntityInfoDto[]) {
    let entityInfo: EntityInfoDto | null = entityInfoCache.find((e) => e.id === entityId);
    if (!entityInfo) {
      entityInfo = await this.entityInfoService.findOne({ accountId, user, entityId });
      if (entityInfo) {
        entityInfoCache.push(entityInfo);
      }
    }
    return entityInfo ?? null;
  }

  async getThreadWithPayload(
    accountId: number,
    user: User,
    mailboxId: number,
    messageId: number,
  ): Promise<MailMessageDto[]> {
    const mailbox = await this.mailboxService.findOne({ accountId, mailboxId, accessibleUserId: user.id });
    const { threadId } = await this.getById(accountId, mailboxId, messageId);
    const messages = await this.repository.find({
      where: { accountId, mailboxId: mailbox.id, threadId },
      order: { date: 'DESC' },
    });

    const payloads = await this.mailMessagePayloadService.findByMessageIds(
      accountId,
      messages.map((message) => message.id),
    );

    const entityInfoCache: EntityInfoDto[] = [];
    const messageDtos: MailMessageDto[] = [];
    for (const message of messages) {
      const payload = payloads.filter((p) => p.messageId === message.id).map((p) => p.toDto());
      const entityInfo = message.entityId
        ? await this.getEntityInfoCached(accountId, user, message.entityId, entityInfoCache)
        : null;
      messageDtos.push(MailMessageDto.create(message, payload, entityInfo));
    }
    return messageDtos;
  }

  async getMessageWithPayload(
    accountId: number,
    user: User,
    mailboxId: number,
    messageId: number,
  ): Promise<MailMessageDto> {
    const mailbox = await this.mailboxService.findOne({ accountId, mailboxId, accessibleUserId: user.id });
    if (mailbox) {
      const message = await this.repository.findOneBy({ accountId, mailboxId: mailbox.id, id: messageId });
      if (message) {
        const payloads = await this.mailMessagePayloadService.findByMessageId(accountId, message.id);

        const entityInfo = message.entityId
          ? await this.entityInfoService.findOne({ accountId, user, entityId: message.entityId })
          : null;

        return MailMessageDto.create(
          message,
          payloads.map((p) => p.toDto()),
          entityInfo,
        );
      }
    }

    throw NotFoundError.withId(MailMessage, messageId);
  }

  async getMessageAttachment(
    accountId: number,
    userId: number,
    mailboxId: number,
    messageId: number,
    payloadId: number,
  ): Promise<MailMessageAttachment | null> {
    const mailbox = await this.mailboxService.findOne({ accountId, mailboxId, accessibleUserId: userId });
    const message = await this.repository.findOneBy({ accountId, mailboxId, id: messageId });
    return this.mailMessagePayloadService.getAttachment(accountId, mailbox, message, payloadId);
  }

  async moveThreadToSpecialFolder(
    accountId: number,
    mailboxId: number,
    threadId: string,
    folderType: MailboxFolderType,
  ) {
    const messages = await this.repository.findBy({ accountId, mailboxId, threadId });
    if (messages) {
      await this.moveMessagesToSpecialFolder(
        accountId,
        mailboxId,
        messages.map((m) => m.id),
        folderType,
      );
    }
  }

  async moveMessagesToSpecialFolder(
    accountId: number,
    mailboxId: number,
    messageIds: number[],
    type: MailboxFolderType,
  ) {
    const folder = await this.mailboxFolderService.findOne({ accountId, mailboxId, type });
    if (folder) {
      await this.repositoryFolderLink.delete({ messageId: In(messageIds) });
      await this.repositoryFolderLink.insert(messageIds.map((m) => new MailMessageFolder(m, folder.id)));
    }
  }

  async markSeenThread(accountId: number, mailboxId: number, threadId: string, isSeen: boolean) {
    await this.repository.update({ accountId, mailboxId, threadId }, { isSeen });
  }

  async createContact(
    accountId: number,
    user: User,
    mailboxId: number,
    messageId: number,
    dto: CreateContactLeadDto,
  ): Promise<EntityInfoDto | null> {
    const message = await this.repository.findOneBy({ accountId, mailboxId, id: messageId });
    if (!message || !message.sentFrom) {
      return null;
    }

    const email = addressparser(message.sentFrom, { flatten: true })[0];
    const entities = await this.createEntities({
      accountId,
      ownerId: user.id,
      email,
      subject: message.subject,
      settings: dto,
    });

    if (entities?.length) {
      message.entityId = entities[0].id;
      await this.repository.save(message);

      this.eventEmitter.emit(
        MailEventType.MailMessageLinked,
        new MailMessageEvent({
          accountId: message.accountId,
          entityId: message.entityId,
          messageId: message.id,
          messageDate: message.date.toISOString(),
        }),
      );
    }

    const entity = entities?.length > 1 ? entities[1] : entities?.[0];

    return entity ? this.entityInfoService.getEntityInfo({ user, entity, access: true }) : null;
  }

  async processExternalMessages({
    accountId,
    mailbox,
    added,
    updated,
    deleted,
  }: {
    accountId: number;
    mailbox: Mailbox;
    added?: MailMessageExternal[];
    updated?: MailMessageExternal[];
    deleted?: string[];
  }) {
    if (added?.length) {
      await this.upsertMessage({ accountId, mailbox, messages: added });
    }
    if (updated?.length) {
      await this.upsertMessage({ accountId, mailbox, messages: updated });
    }
    if (deleted?.length) {
      await this.deleteMessages(deleted);
    }

    if (added?.length || updated?.length || deleted?.length) {
      await this.mailboxFolderService.actualizeCounters({ accountId, mailboxId: mailbox.id });
    }
  }

  private async upsertMessage({
    accountId,
    mailbox,
    messages,
  }: {
    accountId: number;
    mailbox: Mailbox;
    messages: MailMessageExternal[];
  }) {
    for (const message of messages) {
      //TODO: check folder because messageId could be in many folders like Sent and Inbox then it message to yourself
      const current = await this.repository
        .createQueryBuilder('message')
        .where('message.account_id = :accountId', { accountId: mailbox.accountId })
        .andWhere('message.mailbox_id = :mailboxId', { mailboxId: mailbox.id })
        .andWhere(
          new Brackets((qb) =>
            qb
              .where('message.external_id = :externalId', { externalId: message.id })
              .orWhere('message.message_id = :messageId', { messageId: message.messageId }),
          ),
        )
        .getOne();
      if (current) {
        await this.updateMessage({ accountId, mailbox, current, message });
      } else {
        await this.addMessage({ accountId, mailbox, extMessage: message });
      }
    }
  }

  private async addMessage({
    accountId,
    mailbox,
    extMessage,
  }: {
    accountId: number;
    mailbox: Mailbox;
    extMessage: MailMessageExternal;
  }) {
    if (!extMessage.id) {
      extMessage.id = uuidv4();
    }
    const prevMessage = await this.findPreviousMessage(accountId, mailbox.id, extMessage);
    if (!extMessage.threadId) {
      extMessage.threadId = prevMessage ? prevMessage.threadId : uuidv4();
    }
    const folders = await this.mailboxFolderService.findMany({
      accountId,
      mailboxId: mailbox.id,
      externalId: extMessage.folders,
    });

    const isInbox = folders.some((f) => f.type === MailboxFolderType.Inbox);
    const entityId = await this.findEntityId({ accountId, message: extMessage, mailbox, prevMessage, isInbox });

    const message = await this.repository.save(MailMessage.create(accountId, mailbox.id, entityId, extMessage));
    if (folders) {
      await this.repositoryFolderLink.insert(folders.map((f) => new MailMessageFolder(message.id, f.id)));
    }
    if (extMessage.payloads && extMessage.payloads.length > 0) {
      await this.mailMessagePayloadService.processExternalPayloads(accountId, message.id, extMessage.payloads);
    }

    this.eventEmitter.emit(
      MailEventType.MailMessageReceived,
      new MailMessageReceivedEvent({
        accountId: accountId,
        ownerId: mailbox.ownerId,
        entityId: entityId,
        messageId: message.id,
        messageSubject: message.subject,
        messageSnippet: message.snippet,
        messageDate: message.date.toISOString(),
        isInbox,
      }),
    );
  }

  private async updateMessage({
    accountId,
    mailbox,
    current,
    message,
  }: {
    accountId: number;
    mailbox: Mailbox;
    current: MailMessage;
    message: MailMessageExternal;
  }) {
    message.entityId = message.entityId
      ? await this.entityService.ensureExistId(accountId, message.entityId)
      : current.entityId;
    await this.repository.update(current.id, current.update(message));
    await this.repositoryFolderLink.delete({ messageId: current.id });
    const folders = await this.mailboxFolderService.findMany({
      accountId,
      mailboxId: mailbox.id,
      externalId: message.folders,
    });
    if (folders) {
      await this.repositoryFolderLink.insert(folders.map((f) => new MailMessageFolder(current.id, f.id)));
    }
  }

  private async deleteMessages(messagesDeleted: string[]) {
    const messages = await this.repository.findBy({ externalId: In(messagesDeleted) });
    const result = await this.repository.delete({ externalId: In(messagesDeleted) });
    if (!result.affected && !messages) {
      return;
    }
    for (const message of messages) {
      this.eventEmitter.emit(
        MailEventType.MailMessageDeleted,
        new MailMessageEvent({
          accountId: message.accountId,
          entityId: message.entityId,
          messageId: message.id,
          messageDate: message.date.toISOString(),
        }),
      );
    }
  }

  private async findPreviousMessage(
    accountId: number,
    mailboxId: number,
    message: MailMessageExternal,
  ): Promise<MailMessage | null> {
    if (message.inReplyTo) {
      const prevMessage = await this.repository.findOneBy({ accountId, mailboxId, messageId: message.inReplyTo });
      if (prevMessage) {
        return prevMessage;
      }
    }
    if (message.references) {
      const refMessages = await this.repository.find({
        where: { accountId, mailboxId, messageId: In(message.references) },
        order: { date: 'desc' },
        take: 1,
      });
      if (refMessages && refMessages.length > 0) {
        return refMessages[0];
      }
    }
    return null;
  }

  private async findEntityId({
    accountId,
    message,
    mailbox,
    prevMessage,
    isInbox,
  }: {
    accountId: number;
    message: MailMessageExternal;
    mailbox: Mailbox;
    prevMessage: MailMessage | null;
    isInbox: boolean;
  }): Promise<number | null> {
    if (message.entityId) {
      return this.entityService.ensureExistId(accountId, message.entityId);
    }
    if (prevMessage?.entityId) {
      return this.entityService.ensureExistId(accountId, prevMessage.entityId);
    }
    if (isInbox && mailbox.entitySettings) {
      const entities = await this.createEntities({
        accountId,
        ownerId: mailbox.ownerId,
        email: message.sentFrom.values[0],
        subject: message.subject,
        settings: {
          contactTypeId: mailbox.entitySettings.contactEntityTypeId,
          leadTypeId: mailbox.entitySettings.leadEntityTypeId,
          leadBoardId: mailbox.entitySettings.leadBoardId,
          leadStageId: mailbox.entitySettings.leadStageId,
          leadName: mailbox.entitySettings.leadName,
          ownerId: mailbox.entitySettings.ownerId,
          checkActiveLead: mailbox.entitySettings.checkActiveLead,
          checkDuplicate: mailbox.entitySettings.checkDuplicate,
        },
      });
      return entities.length ? entities[0].id : null;
    }
    return null;
  }

  private async createEntities({
    accountId,
    ownerId,
    email,
    subject,
    settings,
  }: {
    accountId: number;
    ownerId: number;
    email: EmailAddressValue;
    subject: string;
    settings: CreateContactLeadDto;
  }): Promise<Entity[]> {
    if (!settings.leadTypeId && !settings.contactTypeId) {
      return null;
    }

    const fieldValues = email?.address ? [{ fieldType: FieldType.Email, value: email.address }] : [];
    const lead = settings.leadTypeId
      ? {
          ownerId: settings.ownerId,
          entityTypeId: settings.leadTypeId,
          boardId: settings.leadBoardId,
          stageId: settings.leadStageId,
          name: settings.leadName || subject || email?.name || email?.address,
          fieldValues,
        }
      : null;
    const contact = settings.contactTypeId
      ? {
          ownerId: settings.ownerId,
          entityTypeId: settings.contactTypeId,
          name: email?.name,
          fieldValues,
          linkedEntities: lead ? [lead] : undefined,
        }
      : null;

    if (contact || lead) {
      const user = await this.userService.findOne({ accountId, id: settings.ownerId ?? ownerId });
      return this.entityService.createSimple({
        accountId,
        user,
        dto: contact ?? lead,
        options: { checkActiveLead: settings.checkActiveLead, checkDuplicate: settings.checkDuplicate },
      });
    }

    return [];
  }
}
