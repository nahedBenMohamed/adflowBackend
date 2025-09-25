/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductPricePrecision1714557065128 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "product_price" ALTER COLUMN "unit_price" TYPE numeric(15,2);
      `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
