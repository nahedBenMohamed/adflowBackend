/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProductsSectionType1691397636905 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table products_section add column "type" character varying not null default 'sale';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
