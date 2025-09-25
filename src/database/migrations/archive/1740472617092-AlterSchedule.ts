/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSchedule1740472617092 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table schedule add column time_buffer_before integer;
      alter table schedule add column time_buffer_after integer;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
