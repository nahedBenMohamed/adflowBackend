import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { FrontendObjectDto } from '../dto';

@Entity()
export class FrontendObject {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column({ unique: true })
  key: string;

  @Column({ type: 'jsonb' })
  value: unknown;

  @CreateDateColumn()
  createdAt: Date;

  constructor(accountId: number, key: string, value: unknown) {
    this.accountId = accountId;
    this.key = key;
    this.value = value;
  }

  public toDto(): FrontendObjectDto {
    return {
      key: this.key,
      value: this.value,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
