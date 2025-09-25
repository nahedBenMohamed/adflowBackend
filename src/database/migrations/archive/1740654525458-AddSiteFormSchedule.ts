/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSiteFormSchedule1740654525458 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table if not exists site_form_schedule (
        form_id integer not null,
        schedule_id integer not null,
        account_id integer not null,
        primary key (form_id, schedule_id),
        foreign key (form_id) references site_form(id) on delete cascade,
        foreign key (schedule_id) references schedule(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
