/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAppsumoTier1720530714621 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table appsumo_tier rename column user_count to user_limit;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
