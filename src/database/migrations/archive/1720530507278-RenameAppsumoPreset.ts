/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAppsumoPreset1720530507278 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table appsumo_preset rename to appsumo_tier;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
