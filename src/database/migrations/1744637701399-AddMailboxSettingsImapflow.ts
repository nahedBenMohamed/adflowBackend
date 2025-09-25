/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMailboxSettingsImapflow1744637701399 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table mailbox_settings_imapflow (
        mailbox_id integer,
        account_id integer not null,
        password text not null,
        imap_server text not null,
        imap_port smallint not null,
        imap_secure boolean not null,
        smtp_server text not null,
        smtp_port smallint not null,
        smtp_secure boolean not null,
        sync_info jsonb,
        primary key (mailbox_id),
        foreign key (mailbox_id) references mailbox(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
