/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductsSectionEnableWarehouse1692170842159 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table products_section add column enable_warehouse boolean;

      update products_section set enable_warehouse = 
        (select count(warehouse.id) > 0 from warehouse where warehouse.section_id = products_section.id);

      alter table products_section alter column enable_warehouse set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
