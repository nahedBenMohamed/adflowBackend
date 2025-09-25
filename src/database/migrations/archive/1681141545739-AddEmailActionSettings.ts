/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailActionSettings1681141545739 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table email_action_settings
        (
            action_id    integer,
            subject      varchar not null,
            content      varchar,
            send_as_html boolean not null,
            mailbox_id   integer,
            user_id      integer,
            account_id   integer not null,
            primary key (action_id),
            foreign key (action_id) references action (id) on delete cascade,
            foreign key (mailbox_id) references mailbox (id) on delete cascade,
            foreign key (user_id) references users (id) on delete cascade,
            foreign key (account_id) references account (id) on delete cascade
        );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
