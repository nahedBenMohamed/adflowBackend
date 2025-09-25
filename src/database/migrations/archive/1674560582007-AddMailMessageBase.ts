/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMailMessageBase1674560582007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create sequence if not exists mail_message_id_seq as integer minvalue 28023001;
      create table mail_message (
        id integer,
        mailbox_id integer not null,
        external_id character varying not null,
        thread_id character varying,
        snippet character varying,
        sent_from character varying not null,
        sent_to character varying not null,
        subject character varying,
        date timestamp without time zone not null,
        account_id integer not null,
        primary key (id),
        foreign key (mailbox_id) references mailbox(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
  
      create sequence if not exists mail_message_payload_id_seq as integer minvalue 29023001;
      create table mail_message_payload (
        id integer,
        message_id integer not null,
        mime_type character varying not null,
        filename character varying,
        attachment character varying,
        content character varying,
        account_id integer not null,
        primary key (id),
        foreign key (message_id) references mail_message(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
  
      create sequence if not exists mailbox_folder_id_seq as integer minvalue 31023001;
      create table mailbox_folder (
        id integer,
        mailbox_id integer not null,
        external_id character varying not null,
        name character varying not null,
        type character varying not null,
        account_id integer not null,
        primary key (id),
        foreign key (mailbox_id) references mailbox(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
  
      create table mail_message_folder (
        message_id integer,
        folder_id integer,
        foreign key (message_id) references mail_message(id) on delete cascade,
        foreign key (folder_id) references mailbox_folder(id) on delete cascade,
        primary key (message_id, folder_id)
      );
  
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
