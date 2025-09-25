/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRentalOrderOrderNumber1692172318353 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table rental_order add column order_number integer;

      with NumberedOrders as (
          select 
              id, 
              row_number() over(partition by entity_id order by created_at asc) as new_order_number
          from rental_order
      )
      update rental_order 
      set order_number = NumberedOrders.new_order_number
      from NumberedOrders
      where rental_order.id = NumberedOrders.id;
      
      alter table rental_order alter column order_number set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
