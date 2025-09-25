/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AppsumoLicenseUnique1720434041376 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table appsumo_license add unique (license_key);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
