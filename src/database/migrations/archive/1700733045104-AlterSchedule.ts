/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSchedule1700733045104 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table schedule add column appointment_limit integer;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
