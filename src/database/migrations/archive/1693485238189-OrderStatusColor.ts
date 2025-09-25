/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderStatusColor1693485238189 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update order_status set color='#ea925a' where code='reserved';
      update order_status set color='#a33cab' where code='sent_for_shipment';
      update order_status set color='#8af039' where code='shipped';
      update order_status set color='#ee675c' where code='cancelled';
      update order_status set color='#c0c5cc' where code='returned';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
