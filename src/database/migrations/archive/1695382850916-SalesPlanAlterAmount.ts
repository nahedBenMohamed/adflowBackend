/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SalesPlanAlterAmount1695382850916 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table sales_plan alter column amount type integer;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
