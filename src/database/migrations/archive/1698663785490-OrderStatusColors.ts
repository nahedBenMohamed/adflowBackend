/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderStatusColors1698663785490 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update order_status set color='#f68828' where code = 'reserved';
      update order_status set color='#1dd7d7' where code = 'sent_for_shipment';
      update order_status set color='#69d222' where code = 'shipped';
      update order_status set color='#f8654f' where code = 'cancelled';
      update order_status set color='#acb5c3' where code = 'returned';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
