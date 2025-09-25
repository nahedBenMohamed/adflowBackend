/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProductPrice1703085253100 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table product_price add column max_discount integer default null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
