/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterWarehouse1731512848862 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from warehouse where is_deleted = true;
      alter table warehouse drop column is_deleted;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
