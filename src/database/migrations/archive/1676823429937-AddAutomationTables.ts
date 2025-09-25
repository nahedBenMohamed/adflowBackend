/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAutomationTables1676823429937 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table trigger
        (
            id         integer,
            type       varchar(100) not null,
            account_id integer      not null,
            primary key (id),
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence trigger_id_seq as integer minvalue 51011001;

        create table action
        (
            id         integer,
            type       varchar(100) not null,
            delay      integer,
            account_id integer      not null,
            primary key (id),
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence action_id_seq as integer minvalue 51011001;

        create table automation
        (
            id         integer,
            trigger_id integer not null,
            action_id  integer not null,
            created_by integer not null,
            is_active  boolean not null,
            account_id integer not null,
            created_at timestamp without time zone not null,
            primary key (id),
            foreign key (trigger_id) references trigger (id),
            foreign key (action_id) references action (id),
            foreign key (created_by) references users (id),
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence automation_id_seq as integer minvalue 51011001;

        create table activity_action_settings
        (
            action_id             integer,
            responsible_user_type varchar(100) not null,
            responsible_user_id   integer,
            activity_type_id      integer      not null,
            text                  varchar      not null,
            deadline_type         varchar(100) not null,
            deadline_time         integer,
            account_id            integer      not null,
            primary key (action_id),
            foreign key (action_id) references action (id) on delete cascade,
            foreign key (responsible_user_id) references users (id) on delete cascade,
            foreign key (activity_type_id) references activity_type (id) on delete cascade,
            foreign key (account_id) references account (id) on delete cascade
        );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
