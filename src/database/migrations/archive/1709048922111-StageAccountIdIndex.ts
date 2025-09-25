/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class StageAccountIdIndex1709048922111 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create index stage_account_id_idx on stage(account_id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
