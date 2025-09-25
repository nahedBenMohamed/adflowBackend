/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameScheduleEvent1692890628636 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table schedule_event rename to schedule_appointment;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
