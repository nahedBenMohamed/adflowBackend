import { Column, Entity, PrimaryColumn } from 'typeorm';

import { ImapSyncInfo } from '../../common';
import { UpdateMailboxSettingsManualDto } from '../../Service/MailboxManual/Dto/UpdateMailboxSettingsManualDto';

@Entity()
export class MailboxSettingsManual {
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
  imapSync: ImapSyncInfo[] | null;

  @Column()
  accountId: number;

  constructor(
    mailboxId: number,
    accountId: number,
    password: string,
    imapServer: string,
    imapPort: number,
    imapSecure: boolean,
    smtpServer: string,
    smtpPort: number,
    smtpSecure: boolean,
    imapSync: ImapSyncInfo[] | null = null,
  ) {
    this.mailboxId = mailboxId;
    this.accountId = accountId;
    this.password = password;
    this.imapServer = imapServer;
    this.imapPort = imapPort;
    this.imapSecure = imapSecure;
    this.smtpServer = smtpServer;
    this.smtpPort = smtpPort;
    this.smtpSecure = smtpSecure;
    this.imapSync = imapSync;
  }

  public static create(mailboxId: number, accountId: number, dto: UpdateMailboxSettingsManualDto) {
    return new MailboxSettingsManual(
      mailboxId,
      accountId,
      dto.password,
      dto.imapServer,
      dto.imapPort,
      dto.imapSecure,
      dto.smtpServer,
      dto.smtpPort,
      dto.smtpSecure,
    );
  }

  public update(dto: UpdateMailboxSettingsManualDto): MailboxSettingsManual {
    if (dto.password) {
      this.password = dto.password;
    }
    this.imapServer = dto.imapServer;
    this.imapPort = dto.imapPort;
    this.imapSecure = dto.imapSecure;
    this.smtpServer = dto.smtpServer;
    this.smtpPort = dto.smtpPort;
    this.smtpSecure = dto.smtpSecure;
    return this;
  }

  public updateImapSync(imapSync: ImapSyncInfo[] | null): MailboxSettingsManual {
    this.imapSync = imapSync;
    return this;
  }
}
