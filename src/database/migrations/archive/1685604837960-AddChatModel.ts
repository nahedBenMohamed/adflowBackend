/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatModel1685604837960 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create sequence if not exists chat_provider_id_seq as integer minvalue 1;
      create table chat_provider (
        id integer,
        created_by integer not null,
        type character varying not null,
        title character varying,
        account_id integer not null,
        created_at timestamp without time zone not null,
        primary key (id),
        foreign key (created_by) references users(id),
        foreign key (account_id) references account(id) on delete cascade
      );

      create sequence if not exists chat_provider_user_id_seq as integer minvalue 1;
      create table chat_provider_user (
        id integer,
        provider_id integer not null,
        user_id integer not null,
        account_id integer,
        primary key (id),
        foreign key (provider_id) references chat_provider(id) on delete cascade,
        foreign key (user_id) references users(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    
      create sequence if not exists chat_id_seq as integer minvalue 1;
      create table chat (
        id integer,
        provider_id integer not null,
        created_by integer not null,
        external_id character varying,
        type character varying not null,
        title character varying,
        entity_id integer,
        account_id integer not null,
        created_at timestamp without time zone not null,
        primary key (id),
        foreign key (provider_id) references chat_provider(id),
        foreign key (created_by) references users(id),
        foreign key (entity_id) references entity(id) on delete set null,
        foreign key (account_id) references account(id) on delete cascade
      );

      create sequence if not exists chat_user_id_seq as integer minvalue 1;
      create table chat_user (
        id integer,
        chat_id integer not null,
        user_id integer not null,
        external_id character varying,
        role character varying not null,
        account_id integer not null,
        primary key (id),
        foreign key (chat_id) references chat(id) on delete cascade,
        foreign key (user_id) references users(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    
      create sequence if not exists chat_message_id_seq as integer minvalue 1;
      create table chat_message (
        id integer,
        chat_id integer not null,
        chat_user_id integer not null,
        external_id character varying,
        text character varying not null,
        account_id integer not null,
        created_at timestamp without time zone not null,
        primary key (id),
        foreign key (chat_id) references chat(id) on delete cascade,
        foreign key (chat_user_id) references chat_user(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );

      create sequence if not exists chat_message_file_id_seq as integer minvalue 1;
      create table chat_message_file (
        id integer,
        message_id integer not null,
        external_id character varying,
        file_link_id integer,
        account_id integer not null,
        primary key (id),
        foreign key (message_id) references chat_message(id) on delete cascade,
        foreign key (file_link_id) references file_link(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    
      create table chat_message_user_status (
        message_id integer not null,
        chat_user_id integer not null,
        status character varying not null,
        account_id integer not null,
        created_at timestamp without time zone not null,
        foreign key (message_id) references chat_message(id) on delete cascade,
        foreign key (chat_user_id) references chat_user(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade,
        primary key (message_id, chat_user_id)
      );
    
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
