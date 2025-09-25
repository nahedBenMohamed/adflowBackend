/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameAppSumo1720423711324 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table app_sumo_preset rename to appsumo_preset;
      alter table app_sumo_license rename to appsumo_license;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
