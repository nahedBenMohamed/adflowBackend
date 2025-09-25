/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationSettings1677765215861 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create sequence if not exists notification_settings_id_seq as integer minvalue 62011001;
      create table notification_settings (
        id integer,
        account_id integer not null,
        user_id integer not null,
        enable_popup boolean not null default true,
        primary key (id),
        foreign key (account_id) references account(id) on delete cascade,
        foreign key (user_id) references users(id) on delete cascade
      );
    
      create sequence if not exists notification_type_settings_id_seq as integer minvalue 63011001;
      create table notification_type_settings (
        id integer,
        account_id integer not null,
        settings_id integer not null,
        type character varying not null,
        is_enabled boolean not null default true,
        object_id integer,
        before integer,
        primary key (id),
        foreign key (account_id) references account(id) on delete cascade,
        foreign key (settings_id) references notification_settings(id) on delete cascade
      );
    
      create table notification_type_follow_user (
        type_id integer,
        user_id integer,
        account_id integer not null,
        primary key (type_id, user_id),
        foreign key (type_id) references notification_type_settings(id) on delete cascade,
        foreign key (user_id) references users(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
