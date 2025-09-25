import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class TestAccount {
  @PrimaryColumn()
  accountId: number;
}
