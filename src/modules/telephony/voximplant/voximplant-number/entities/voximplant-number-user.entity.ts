import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class VoximplantNumberUser {
  @PrimaryColumn()
  numberId: number;

  @PrimaryColumn()
  userId: number;

  @Column()
  accountId: number;

  constructor(accountId: number, numberId: number, userId: number) {
    this.accountId = accountId;
    this.numberId = numberId;
    this.userId = userId;
  }
}
