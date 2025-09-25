/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSchedulerAppointment1700820935837 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`

      update schedule_appointment sa
        set performer_id = 
          (select id from schedule_performer sp where sp.schedule_id = sa.schedule_id order by sp.id limit 1)
        where performer_id is null;
      
      alter table schedule_appointment alter column performer_id set not null;

      alter table schedule_appointment drop column if exists old_performer_id;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
