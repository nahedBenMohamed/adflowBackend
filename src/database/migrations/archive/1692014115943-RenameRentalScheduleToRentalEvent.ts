/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameRentalScheduleToRentalEvent1692014115943 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table rental_schedule rename to rental_event;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
