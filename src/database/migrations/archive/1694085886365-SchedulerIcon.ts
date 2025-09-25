/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SchedulerIcon1694085886365 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table schedule add column icon character varying not null default '';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
