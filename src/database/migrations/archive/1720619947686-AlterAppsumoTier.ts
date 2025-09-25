/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAppsumoTier1720619947686 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update appsumo_tier set plan_name='AppSumo Tier 1' where tier=1;
      update appsumo_tier set plan_name='AppSumo Tier 2' where tier=2;
      update appsumo_tier set plan_name='AppSumo Tier 3' where tier=3;
      update appsumo_tier set plan_name='AppSumo Tier 4' where tier=4;
      update appsumo_tier set plan_name='AppSumo Tier 5' where tier=5;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
