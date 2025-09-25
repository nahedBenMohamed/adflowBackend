/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterOrderItemCascadeDelete1692283603851 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table rental_order_item
        drop constraint rental_order_item_product_id_fkey,
        add constraint rental_order_item_product_id_fkey foreign key (product_id) references product(id) on delete cascade;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
