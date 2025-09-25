import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { CreateUserTokenDto, UserTokenDto } from '../dto';
import { DateUtil } from '@/common';

@Entity()
export class UserToken {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  accountId: number;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column()
  createdAt: Date;

  @Column({ nullable: true, default: null })
  expiresAt: Date | null;

  @Column({ nullable: true, default: null })
  lastUsedAt: Date | null;

  constructor(accountId: number, userId: number, name: string, code: string, expiresAt?: Date | null) {
    this.accountId = accountId;
    this.userId = userId;
    this.name = name;
    this.code = code;
    this.createdAt = new Date();
    this.expiresAt = expiresAt ?? null;
  }

  static fromDto({
    accountId,
    userId,
    data,
  }: {
    accountId: number;
    userId: number;
    data: CreateUserTokenDto & { code: string };
  }): UserToken {
    return new UserToken(
      accountId,
      userId,
      data.name,
      data.code,
      data.expiresAt ? DateUtil.fromISOString(data.expiresAt) : null,
    );
  }

  toDto(): UserTokenDto {
    return {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt.toISOString(),
      expiresAt: this.expiresAt?.toISOString(),
      lastUsedAt: this.lastUsedAt?.toISOString(),
    };
  }

  isExpired(): boolean {
    return this.expiresAt ? this.expiresAt < DateUtil.now() : false;
  }
}
