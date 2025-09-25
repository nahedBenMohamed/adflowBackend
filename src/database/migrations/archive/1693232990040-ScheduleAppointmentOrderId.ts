/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ScheduleAppointmentOrderId1693232990040 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table schedule_appointment
        add column order_id integer,
        add foreign key (order_id) references orders(id) on delete set null;  
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
