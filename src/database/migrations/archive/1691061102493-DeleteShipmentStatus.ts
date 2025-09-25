/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteShipmentStatus1691061102493 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop table shipment_status;
      drop sequence shipment_status_id_seq;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
