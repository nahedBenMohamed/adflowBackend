import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateUtil } from '@/common';

import { MailboxProvider, MailboxState } from '../../common';

import { CreateMailboxDto, MailboxDto, UpdateMailboxDto } from '../dto';
import { MailboxAccessibleUser } from './mailbox-accessible-user.entity';
import { MailboxEntitySettings } from './mailbox-entity-settings.entity';

const Default = {
  emailsPerDay: 100,
};

@Entity()
export class Mailbox {
  @PrimaryGeneratedColumn('identity')
  id: number;

  @Column()
  email: string;

  @Column()
  provider: string;

  @Column()
  ownerId: number | null;

  @Column()
  state: MailboxState;

  @Column({ nullable: true })
  errorMessage: string | null;

  @Column()
  emailsPerDay: number;

  @Column()
  accountId: number;

  @Column()
  createdAt: Date;

  @Column({ nullable: true })
  lastActiveAt: Date | null;

  constructor(
    accountId: number,
    email: string,
    provider: string,
    ownerId: number | null,
    state: MailboxState,
    emailsPerDay: number,
    createdAt?: Date,
  ) {
    this.accountId = accountId;
    this.email = email;
    this.provider = provider;
    this.ownerId = ownerId;
    this.state = state;
    this.emailsPerDay = emailsPerDay;
    this.createdAt = createdAt ?? DateUtil.now();
  }

  private _accessibleUsers: MailboxAccessibleUser[];
  get accessibleUsers(): MailboxAccessibleUser[] {
    return this._accessibleUsers;
  }
  set accessibleUsers(value: MailboxAccessibleUser[]) {
    this._accessibleUsers = value;
  }

  private _entitySettings: MailboxEntitySettings | null;
  get entitySettings(): MailboxEntitySettings | null {
    return this._entitySettings;
  }
  set entitySettings(value: MailboxEntitySettings | null) {
    this._entitySettings = value;
  }

  static fromDto({
    accountId,
    userId,
    dto,
  }: {
    accountId: number;
    userId: number;
    dto: CreateMailboxDto & { state?: MailboxState };
  }): Mailbox {
    return new Mailbox(
      accountId,
      dto.email,
      dto.provider ?? Mailbox.getMailboxProvider(dto.email),
      dto.ownerId ?? userId,
      dto.state ?? MailboxState.Draft,
      dto.emailsPerDay ?? Default.emailsPerDay,
    );
  }

  update(data: UpdateMailboxDto & { state?: MailboxState }): Mailbox {
    this.email = data.email ?? this.email;
    this.ownerId = data.ownerId ?? this.ownerId;
    this.state = data.state ?? this.state;
    this.emailsPerDay = data.emailsPerDay ?? this.emailsPerDay;

    return this;
  }

  toDto(): MailboxDto {
    return {
      id: this.id,
      email: this.email,
      provider: this.provider,
      ownerId: this.ownerId,
      state: this.state,
      errorMessage: this.errorMessage,
      emailsPerDay: this.emailsPerDay,
      accessibleUserIds: this.accessibleUsers?.map((user) => user.userId),
      entitySettings: this.entitySettings?.toDto(),
    };
  }

  private static getMailboxProvider(email: string): MailboxProvider {
    return email.includes('gmail.com') ? MailboxProvider.GMail : MailboxProvider.Manual;
  }
}
