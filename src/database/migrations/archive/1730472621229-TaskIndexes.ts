/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class TaskIndexes1730472621229 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_task_account_stage_created_by ON task (account_id, stage_id, created_by);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
