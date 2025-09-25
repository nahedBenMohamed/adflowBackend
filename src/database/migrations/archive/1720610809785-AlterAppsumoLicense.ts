/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAppsumoLicense1720610809785 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table appsumo_license add column prev_license_key text;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
