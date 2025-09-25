/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CascadeDeleteShipment1693556962547 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table shipment
        drop constraint shipment_warehouse_id_fkey,
        drop constraint shipment_order_id_fkey,
        add constraint shipment_warehouse_id_fkey foreign key (warehouse_id) references warehouse(id) on delete cascade,
        add constraint shipment_order_id_fkey foreign key (order_id) references orders(id) on delete cascade;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
