/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSchedule1741701747438 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update schedule set time_period = 1800 where time_period is null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
