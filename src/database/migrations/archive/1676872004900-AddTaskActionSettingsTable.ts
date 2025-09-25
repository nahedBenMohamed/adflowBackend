/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskActionSettingsTable1676872004900 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table task_action_settings
        (
            action_id             integer,
            responsible_user_type varchar(100) not null,
            responsible_user_id   integer,
            title                 varchar      not null,
            text                  varchar      not null,
            deadline_type         varchar(100) not null,
            deadline_time         integer,
            account_id            integer      not null,
            primary key (action_id),
            foreign key (action_id) references action (id) on delete cascade,
            foreign key (responsible_user_id) references users (id) on delete cascade,
            foreign key (account_id) references account (id) on delete cascade
        );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
