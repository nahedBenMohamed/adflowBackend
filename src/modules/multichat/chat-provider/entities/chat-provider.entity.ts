import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { ChatProviderStatus, ChatProviderTransport, ChatProviderType } from '../../common';
import { ChatProviderUser } from '../../chat-provider-user';
import { CreateChatProviderDto, ChatProviderDto, UpdateChatProviderDto } from '../dto';
import { ChatProviderEntitySettings } from './chat-provider-entity-settings.entity';

@Entity()
export class ChatProvider {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  createdBy: number;

  @Column()
  type: ChatProviderType;

  @Column()
  transport: ChatProviderTransport;

  @Column({ nullable: true })
  title: string | null;

  @Column()
  status: ChatProviderStatus;

  @Column()
  messagePerDay: number;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    createdBy: number,
    type: ChatProviderType,
    transport: ChatProviderTransport,
    title: string | null,
    status: ChatProviderStatus,
    messagePerDay: number,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.createdBy = createdBy;
    this.type = type;
    this.transport = transport;
    this.title = title;
    this.status = status;
    this.messagePerDay = messagePerDay;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  private _accessibleUsers: ChatProviderUser[];
  get accessibleUsers(): ChatProviderUser[] {
    return this._accessibleUsers;
  }
  set accessibleUsers(value: ChatProviderUser[]) {
    this._accessibleUsers = value;
  }

  private _responsibleUsers: ChatProviderUser[];
  get responsibleUsers(): ChatProviderUser[] {
    return this._responsibleUsers;
  }
  set responsibleUsers(value: ChatProviderUser[]) {
    this._responsibleUsers = value;
  }

  private _unseenCount: number | null;
  get unseenCount(): number | null {
    return this._unseenCount;
  }
  set unseenCount(value: number | null) {
    this._unseenCount = value;
  }

  private _supervisorUsers: ChatProviderUser[];
  get supervisorUsers(): ChatProviderUser[] {
    return this._supervisorUsers;
  }
  set supervisorUsers(value: ChatProviderUser[]) {
    this._supervisorUsers = value;
  }

  private _entitySettings: ChatProviderEntitySettings | null;
  get entitySettings(): ChatProviderEntitySettings | null {
    return this._entitySettings;
  }
  set entitySettings(value: ChatProviderEntitySettings | null) {
    this._entitySettings = value;
  }

  canSendByPhone(): boolean {
    return [ChatProviderType.Twilio, ChatProviderType.Wazzup].includes(this.type);
  }

  static fromDto(accountId: number, createdBy: number, dto: CreateChatProviderDto): ChatProvider {
    return new ChatProvider(accountId, createdBy, dto.type, dto.transport, dto.title, dto.status, dto.messagePerDay);
  }

  toDto(): ChatProviderDto {
    return {
      id: this.id,
      type: this.type,
      transport: this.transport,
      title: this.title,
      status: this.status,
      messagePerDay: this.messagePerDay,
      accessibleUserIds: this.accessibleUsers?.map((user) => user.userId),
      responsibleUserIds: this.responsibleUsers?.map((user) => user.userId),
      supervisorUserIds: this.supervisorUsers?.map((user) => user.userId),
      unseenCount: this.unseenCount,
      entitySettings: this.entitySettings?.toDto(),
    };
  }

  update(dto: UpdateChatProviderDto): ChatProvider {
    this.title = dto.title !== undefined ? dto.title : this.title;
    this.status = dto.status !== undefined ? dto.status : this.status;
    this.messagePerDay = dto.messagePerDay !== undefined ? dto.messagePerDay : this.messagePerDay;

    return this;
  }
}
