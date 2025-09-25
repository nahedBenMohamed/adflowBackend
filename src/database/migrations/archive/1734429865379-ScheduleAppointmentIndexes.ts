/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ScheduleAppointmentIndexes1734429865379 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE INDEX IF NOT EXISTS idx_appointment_account_schedule_start_end 
ON schedule_appointment (account_id, schedule_id, start_date, end_date);
	
CREATE INDEX IF NOT EXISTS idx_appointment_account_schedule_non_canceled_start_end
ON schedule_appointment (account_id, schedule_id, start_date, end_date)
WHERE status <> 'canceled';
	
REINDEX TABLE schedule_appointment;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
