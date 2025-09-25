/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterRentalOrderItem1691755141714 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from rental_order;

      alter table rental_order_item
        drop column warehouse_id,
        add column unit_price numeric(15,2) not null,
        add column tax numeric(5,2) not null,
        add column discount numeric(5,2) not null;  
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
