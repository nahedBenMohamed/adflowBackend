/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSchedule1730988793369 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table schedule add column one_entity_per_day boolean not null default false;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
