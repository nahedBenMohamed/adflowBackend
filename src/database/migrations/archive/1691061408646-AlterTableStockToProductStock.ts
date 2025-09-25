/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTableStockToProductStock1691061408646 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table stock rename to product_stock;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
