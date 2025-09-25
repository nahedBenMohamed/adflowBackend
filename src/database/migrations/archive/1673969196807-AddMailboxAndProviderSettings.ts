/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMailboxAndProviderSettings1673969196807 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create sequence if not exists mailbox_id_seq as integer minvalue 27023001;

      create table mailbox (
        id integer,
        account_id integer not null,
        created_at timestamp without time zone not null,
        email character varying not null,
        provider character varying not null,
        type character varying not null,
        owner_id integer,
        group_message boolean not null,
        create_contact boolean not null,
        primary key (id),
        foreign key (account_id) references account(id) on delete cascade,
        foreign key (owner_id) references users(id)
      );
    
      create table mailbox_settings_gmail (
        mailbox_id integer,
        account_id integer not null,
        access_token character varying not null,
        refresh_token character varying not null,
        primary key (mailbox_id),
        foreign key (mailbox_id) references mailbox(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    
      create table mailbox_settings_manual (
        "mailbox_id" integer,
        "account_id" integer not null,
        "password" character varying not null,
        "imap_server" character varying not null,
        "imap_port" smallint not null,
        "imap_secure" boolean not null,
        "smtp_server" character varying not null,
        "smtp_port" smallint not null,
        "smtp_secure" boolean not null,
        primary key (mailbox_id),
        foreign key (mailbox_id) references mailbox(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
