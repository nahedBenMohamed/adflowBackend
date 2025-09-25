import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { EntityInfoDto } from '@/modules/entity/entity-info/dto/entity-info.dto';

import { ChatType } from '../../common';
import { ChatMessage } from '../../chat-message/entities/chat-message.entity';
import { ChatUser } from '../../chat-user';
import { CreatePersonalChatDto, CreateGroupChatDto, CreateExternalChatDto, ChatDto } from '../dto';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  providerId: number;

  @Column({ nullable: true })
  createdBy: number | null;

  @Column({ nullable: true })
  externalId: string | null;

  @Column()
  type: ChatType;

  @Column({ nullable: true })
  title: string | null;

  @Column({ nullable: true })
  entityId: number | null;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  @Column({ select: false, insert: false, update: false })
  totalMessageCount: number | null;

  @Column({ select: false, insert: false, update: false })
  seenByUserCount: number | null;

  @Column({ select: false, insert: false, update: false })
  updatedAt: Date;

  constructor(
    accountId: number,
    providerId: number,
    createdBy: number | null,
    externalId: string | null,
    type: ChatType,
    title: string | null,
    entityId: number | null,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.providerId = providerId;
    this.createdBy = createdBy;
    this.externalId = externalId;
    this.type = type;
    this.title = title;
    this.entityId = entityId;
    this.createdAt = createdAt ?? DateUtil.now();
    this.updatedAt = this.createdAt;
  }

  private _users: ChatUser[];
  public set users(value: ChatUser[]) {
    this._users = value;
  }
  public get users(): ChatUser[] {
    return this._users;
  }

  private _pinnedMessages: ChatMessage[];
  public set pinnedMessages(value: ChatMessage[]) {
    this._pinnedMessages = value;
  }
  public get pinnedMessages(): ChatMessage[] {
    return this._pinnedMessages;
  }

  private _lastMessage: ChatMessage | null;
  public set lastMessage(value: ChatMessage | null) {
    this._lastMessage = value;
  }
  public get lastMessage(): ChatMessage | null {
    return this._lastMessage;
  }

  private _entityInfo: EntityInfoDto | null;
  public set entityInfo(value: EntityInfoDto | null) {
    this._entityInfo = value;
  }
  public get entityInfo(): EntityInfoDto | null {
    return this._entityInfo;
  }

  private _hasAccess: boolean | null;
  public get hasAccess(): boolean | null {
    return this._hasAccess;
  }
  public set hasAccess(value: boolean | null) {
    this._hasAccess = value;
  }

  public static personalFromDto(
    accountId: number,
    createdBy: number,
    dto: CreatePersonalChatDto,
    externalId: string | null = null,
  ): Chat {
    return new Chat(accountId, dto.providerId, createdBy, externalId, ChatType.PERSONAL, null, null);
  }

  public static groupFromDto(
    accountId: number,
    createdBy: number,
    dto: CreateGroupChatDto,
    externalId: string | null = null,
  ): Chat {
    return new Chat(accountId, dto.providerId, createdBy, externalId, ChatType.GROUP, dto.title, dto.entityId);
  }

  public static externalFromDto(accountId: number, createdBy: number | null, dto: CreateExternalChatDto): Chat {
    return new Chat(
      accountId,
      dto.providerId,
      createdBy,
      dto.externalId ?? null,
      ChatType.GROUP,
      dto.title,
      dto.entityId,
    );
  }

  public toDto(): ChatDto {
    const users = this._users ? this._users.map((user) => user.toDto()) : [];
    const pinnedMessages = this._pinnedMessages ? this._pinnedMessages.map((message) => message.toDto()) : [];
    const lastMessage = this._lastMessage ? this._lastMessage.toDto() : null;
    const unseenCount = this.totalMessageCount ? this.totalMessageCount - (this.seenByUserCount ?? 0) : 0;
    return {
      id: this.id,
      providerId: this.providerId,
      createdBy: this.createdBy,
      externalId: this.externalId,
      type: this.type,
      title: this.title,
      entityId: this.entityId,
      createdAt: this.createdAt.toISOString(),
      users,
      pinnedMessages,
      lastMessage,
      unseenCount,
      updatedAt: this.updatedAt?.toISOString(),
      entityInfo: this.entityInfo,
      hasAccess: this.hasAccess,
    };
  }
}
