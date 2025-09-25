/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaxIncluded1687877020115 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table orders
            add column tax_included boolean not null default true;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
