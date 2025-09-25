/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DBOptimizationIndex1709047301377 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create index task_account_id_responsible_user_id_stage_id_idx on task(account_id, responsible_user_id, stage_id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
