/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTaskSubtaskSortOrder1719325474889 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table task_subtask add column sort_order integer not null default 0;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
