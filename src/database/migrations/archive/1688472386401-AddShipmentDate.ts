/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShipmentDate1688472386401 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table shipment
            add column shipped_at timestamp without time zone default null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
