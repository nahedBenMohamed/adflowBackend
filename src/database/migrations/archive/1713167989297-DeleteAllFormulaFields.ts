/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteAllFormulaFields1713167989297 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from field where type = 'formula';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
