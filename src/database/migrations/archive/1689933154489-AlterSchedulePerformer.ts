/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSchedulePerformer1689933154489 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table schedule_event
        drop constraint schedule_event_performer_id_fkey,
        add foreign key (performer_id) references users(id);

      alter table schedule_performer drop column id;
      drop sequence schedule_performer_id_seq;

      alter table schedule_performer
        add primary key (schedule_id, user_id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
