/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProductStock1743084130609 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table product_stock alter column stock_quantity type numeric(13,4);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
