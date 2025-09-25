/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScheduledAction1679291439089 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table scheduled_action
        (
            id             integer,
            action_id      integer not null,
            entity_id      integer not null,
            scheduled_time timestamp without time zone not null,
            completed      boolean not null,
            account_id     integer not null,
            primary key (id),
            foreign key (action_id) references action (id) on delete cascade,
            foreign key (entity_id) references entity (id) on delete cascade,
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence scheduled_action_id_seq as integer minvalue 1;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
