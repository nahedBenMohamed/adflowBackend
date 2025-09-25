/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductType1689170448447 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table product
            add column type varchar(50) not null default 'product';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
