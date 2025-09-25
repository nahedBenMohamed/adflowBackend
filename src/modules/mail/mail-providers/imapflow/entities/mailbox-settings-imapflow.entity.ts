import { Column, Entity, PrimaryColumn } from 'typeorm';

import { CreateMailboxSettingsImapflowDto, MailboxSettingsImapflowDto, UpdateMailboxSettingsImapflowDto } from '../dto';
import { ImapflowSyncInfo } from '../types';

@Entity()
export class MailboxSettingsImapflow {
  @PrimaryColumn()
  mailboxId: number;

  @Column()
  password: string;

  @Column()
  imapServer: string;

  @Column()
  imapPort: number;

  @Column()
  imapSecure: boolean;

  @Column()
  smtpServer: string;

  @Column()
  smtpPort: number;

  @Column()
  smtpSecure: boolean;

  @Column({ type: 'jsonb', nullable: true })
  syncInfo: ImapflowSyncInfo[] | null;

  @Column()
  accountId: number;

  constructor(
    accountId: number,
    mailboxId: number,
    password: string,
    imapServer: string,
    imapPort: number,
    imapSecure: boolean,
    smtpServer: string,
    smtpPort: number,
    smtpSecure: boolean,
    syncInfo: ImapflowSyncInfo[] | null = null,
  ) {
    this.accountId = accountId;
    this.mailboxId = mailboxId;
    this.password = password;
    this.imapServer = imapServer;
    this.imapPort = imapPort;
    this.imapSecure = imapSecure;
    this.smtpServer = smtpServer;
    this.smtpPort = smtpPort;
    this.smtpSecure = smtpSecure;
    this.syncInfo = syncInfo;
  }

  static fromDto({
    accountId,
    mailboxId,
    dto,
  }: {
    accountId: number;
    mailboxId: number;
    dto: CreateMailboxSettingsImapflowDto;
  }): MailboxSettingsImapflow {
    return new MailboxSettingsImapflow(
      accountId,
      mailboxId,
      dto.password,
      dto.imapServer,
      dto.imapPort,
      dto.imapSecure,
      dto.smtpServer,
      dto.smtpPort,
      dto.smtpSecure,
    );
  }

  update(dto: UpdateMailboxSettingsImapflowDto & { syncInfo?: ImapflowSyncInfo[] | null }): MailboxSettingsImapflow {
    this.password = dto.password !== undefined ? dto.password : this.password;
    this.imapServer = dto.imapServer !== undefined ? dto.imapServer : this.imapServer;
    this.imapPort = dto.imapPort !== undefined ? dto.imapPort : this.imapPort;
    this.imapSecure = dto.imapSecure !== undefined ? dto.imapSecure : this.imapSecure;
    this.smtpServer = dto.smtpServer !== undefined ? dto.smtpServer : this.smtpServer;
    this.smtpPort = dto.smtpPort !== undefined ? dto.smtpPort : this.smtpPort;
    this.smtpSecure = dto.smtpSecure !== undefined ? dto.smtpSecure : this.smtpSecure;
    this.syncInfo = dto.syncInfo !== undefined ? dto.syncInfo : this.syncInfo;

    return this;
  }

  toDto(): MailboxSettingsImapflowDto {
    return {
      imapServer: this.imapServer,
      imapPort: this.imapPort,
      imapSecure: this.imapSecure,
      smtpServer: this.smtpServer,
      smtpPort: this.smtpPort,
      smtpSecure: this.smtpSecure,
    };
  }
}
