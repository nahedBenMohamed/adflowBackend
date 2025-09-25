/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSchedulerAppointment1700663233866 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table schedule_appointment drop constraint if exists schedule_event_performer_id_fkey;
      alter table schedule_appointment drop constraint if exists schedule_appointment_performer_id_fkey;
      alter table schedule_appointment rename column performer_id to old_performer_id;
      
      alter table schedule_appointment
        add column performer_id integer,
        add foreign key (performer_id) references schedule_performer(id) on delete cascade;
        
      update schedule_appointment sa
        set performer_id = 
          (select id from schedule_performer sp 
            where sp.schedule_id = sa.schedule_id and sp.user_id = sa.old_performer_id);
      
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
