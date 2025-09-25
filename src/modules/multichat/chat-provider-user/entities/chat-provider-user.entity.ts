import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ChatProviderUserType } from '../enums';

@Entity()
export class ChatProviderUser {
  @PrimaryColumn()
  providerId: number;

  @PrimaryColumn()
  userId: number;

  @PrimaryColumn({ type: 'enum', enum: ChatProviderUserType, default: ChatProviderUserType.Accessible })
  type: ChatProviderUserType;

  @Column()
  accountId: number;

  constructor(providerId: number, userId: number, type: ChatProviderUserType, accountId: number) {
    this.providerId = providerId;
    this.userId = userId;
    this.type = type;
    this.accountId = accountId;
  }
}
