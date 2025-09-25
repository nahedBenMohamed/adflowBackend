/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUIDataToExternalEntity1672386954959 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table external_entity rename column data to raw_data;
      alter table external_entity add column ui_data jsonb;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
