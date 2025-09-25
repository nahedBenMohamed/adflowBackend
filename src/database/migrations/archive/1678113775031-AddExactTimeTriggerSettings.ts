/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExactTimeTriggerSettings1678113775031 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table exact_time_trigger_settings
        (
            trigger_id integer,
            date       timestamp without time zone not null,
            account_id integer not null,
            primary key (trigger_id),
            foreign key (trigger_id) references trigger (id) on delete cascade,
            foreign key (account_id) references account (id) on delete cascade
        );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
