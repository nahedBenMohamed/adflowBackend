/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductsSectionEnableBarcode1692604044210 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table products_section add column enable_barcode boolean default true not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
