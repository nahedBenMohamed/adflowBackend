/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterEntityType1719833217147 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table entity_type
        drop column code,
        drop column need_migration;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
