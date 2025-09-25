/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterProductStock1692343747646 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table product_stock
        drop constraint stock_product_id_fkey,
        drop constraint stock_warehouse_id_fkey,
        add constraint stock_product_id_fkey foreign key (product_id) references product(id) on delete cascade,
        add constraint stock_warehouse_id_fkey foreign key (warehouse_id) references warehouse(id) on delete cascade;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
