/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateScheduleAppointmentOwner1733136867799 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update schedule_appointment
      set owner_id = (select responsible_user_id from entity where entity.id = schedule_appointment.entity_id)
      where schedule_appointment.entity_id is not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
