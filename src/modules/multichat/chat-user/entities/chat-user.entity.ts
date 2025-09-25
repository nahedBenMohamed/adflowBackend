import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ChatUserRole } from '../../common';
import { ChatUserDto } from '../dto';
import { ChatUserExternal } from './chat-user-external.entity';

@Entity()
export class ChatUser {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  chatId: number;

  @Column({ nullable: true })
  userId: number | null;

  @Column()
  role: ChatUserRole;

  @Column()
  accountId: number;

  constructor(accountId: number, chatId: number, role: ChatUserRole, userId: number | null) {
    this.accountId = accountId;
    this.chatId = chatId;
    this.role = role;
    this.userId = userId;
  }

  private _externalUser: ChatUserExternal | null;
  public get externalUser(): ChatUserExternal | null {
    return this._externalUser;
  }
  public set externalUser(value: ChatUserExternal | null) {
    this._externalUser = value;
  }

  public toDto(): ChatUserDto {
    return new ChatUserDto({
      id: this.id,
      userId: this.userId,
      role: this.role,
      externalUser: this.externalUser?.toDto() ?? null,
    });
  }
}
