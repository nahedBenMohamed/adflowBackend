/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMailboxSignature1677581691766 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create sequence if not exists mailbox_signature_id_seq as integer minvalue 27023001;

      create table mailbox_signature (
        id integer,
        account_id integer not null,
        created_at timestamp without time zone not null,
        name character varying not null,
        text character varying not null,
        created_by integer not null,
        primary key (id),
        foreign key (account_id) references account(id) on delete cascade,
        foreign key (created_by) references users(id) on delete cascade
      );

      create table mailbox_signature_link (
        account_id integer not null,
        signature_id integer,
        mailbox_id integer,
        primary key (signature_id, mailbox_id),
        foreign key (account_id) references account(id) on delete cascade,
        foreign key (signature_id) references mailbox_signature(id) on delete cascade,
        foreign key (mailbox_id) references mailbox(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
