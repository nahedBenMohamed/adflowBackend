import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class NotificationTypeFollowUser {
  @PrimaryColumn()
  typeId: number;

  @PrimaryColumn()
  userId: number;

  @Column()
  accountId: number;

  constructor(typeId: number, userId: number, accountId: number) {
    this.typeId = typeId;
    this.userId = userId;
    this.accountId = accountId;
  }
}
