/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class IndexesTask1736513599793 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create index if not exists idx_account_external on task(account_id, external_id) where external_id is not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
