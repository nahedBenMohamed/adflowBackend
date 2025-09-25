/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDataToExternalEntity1672306523845 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table external_entity add column data jsonb;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
