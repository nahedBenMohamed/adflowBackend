/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterBoard1728402696162 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table board
        drop column if exists code,
        drop column if exists need_migration;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
