/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsUsedToFileInfo1671439005617 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table file_info add column is_used boolean default false not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
