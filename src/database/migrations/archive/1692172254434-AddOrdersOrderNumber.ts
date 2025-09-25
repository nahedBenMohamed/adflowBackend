/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrdersOrderNumber1692172254434 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table orders add column order_number integer;

      with NumberedOrders as (
          select 
              id, 
              row_number() over(partition by entity_id order by created_at asc) as new_order_number
          from orders
      )
      update orders 
      set order_number = NumberedOrders.new_order_number
      from NumberedOrders
      where orders.id = NumberedOrders.id;
      
      alter table orders alter column order_number set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
