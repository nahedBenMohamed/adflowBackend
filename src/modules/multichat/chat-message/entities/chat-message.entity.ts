import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { ChatUser } from '../../chat-user';
import { ChatMessageFile } from './chat-message-file.entity';
import { ChatMessageReaction } from './chat-message-reaction.entity';
import { ChatMessageUserStatus } from './chat-message-user-status.entity';

import { ChatMessageDto } from '../dto/chat-message.dto';

@Entity()
export class ChatMessage {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  chatId: number;

  @Column()
  chatUserId: number;

  @Column({ nullable: true })
  externalId: string | null;

  @Column({ nullable: true })
  replyToId: number | null;

  @Column()
  text: string;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  constructor(
    accountId: number,
    chatId: number,
    chatUserId: number,
    externalId: string | null,
    replyToId: number | null,
    text: string,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.chatId = chatId;
    this.chatUserId = chatUserId;
    this.externalId = externalId;
    this.replyToId = replyToId;
    this.text = text;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  private _statuses: ChatMessageUserStatus[] | null;
  public get statuses(): ChatMessageUserStatus[] | null {
    return this._statuses;
  }
  public set statuses(value: ChatMessageUserStatus[] | null) {
    this._statuses = value;
  }

  private _files: ChatMessageFile[] | null;
  public get files(): ChatMessageFile[] | null {
    return this._files;
  }
  public set files(value: ChatMessageFile[] | null) {
    this._files = value;
  }

  private _replyTo: ChatMessage | null;
  public get replyTo(): ChatMessage | null {
    return this._replyTo;
  }
  public set replyTo(value: ChatMessage | null) {
    this._replyTo = value;
  }

  private _reactions: ChatMessageReaction[] | null;
  public get reactions(): ChatMessageReaction[] | null {
    return this._reactions;
  }
  public set reactions(value: ChatMessageReaction[] | null) {
    this._reactions = value;
  }

  private _chatUser: ChatUser | null;
  public get chatUser(): ChatUser | null {
    return this._chatUser;
  }
  public set chatUser(value: ChatUser | null) {
    this._chatUser = value;
  }

  public update(replyToId: number | null, text: string): ChatMessage {
    this.replyToId = replyToId;
    this.text = text;
    return this;
  }

  public toDto(): ChatMessageDto {
    const statuses = this._statuses ? this._statuses.map((status) => status.toDto()) : [];
    const files = this._files ? this._files.map((file) => file.toDto()) : [];
    const replyTo = this._replyTo ? this._replyTo.toDto() : null;
    const reactions = this._reactions ? this._reactions.map((reaction) => reaction.toDto()) : [];
    return new ChatMessageDto(
      this.id,
      this.chatId,
      this.chatUserId,
      this.text,
      statuses,
      files,
      replyTo,
      reactions,
      this.createdAt.toISOString(),
    );
  }
}
