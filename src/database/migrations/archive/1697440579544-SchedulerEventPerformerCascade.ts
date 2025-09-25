/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SchedulerEventPerformerCascade1697440579544 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table schedule_appointment
        drop constraint schedule_event_performer_id_fkey,
        add constraint schedule_event_performer_id_fkey foreign key (performer_id) references users(id) on delete cascade;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
