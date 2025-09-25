/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductSectionCancelAfter1710759144910 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table products_section add column cancel_after integer;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
