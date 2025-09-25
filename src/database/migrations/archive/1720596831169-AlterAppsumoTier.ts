/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAppsumoTier1720596831169 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table appsumo_tier add column plan_name text;
      update appsumo_tier set plan_name = 'All in One';
      alter table appsumo_tier alter column plan_name set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
