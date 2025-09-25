/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterRentalOrder1691754596482 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table rental_order
        add column currency character varying,
        add column tax_included boolean not null default true;
  
      update rental_order set currency = 'rub';

      alter table rental_order alter column currency set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
