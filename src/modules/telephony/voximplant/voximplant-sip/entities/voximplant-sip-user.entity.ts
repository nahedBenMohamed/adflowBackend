import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class VoximplantSipUser {
  @PrimaryColumn()
  sipId: number;

  @PrimaryColumn()
  userId: number;

  @Column()
  accountId: number;

  constructor(accountId: number, sipId: number, userId: number) {
    this.accountId = accountId;
    this.sipId = sipId;
    this.userId = userId;
  }
}
