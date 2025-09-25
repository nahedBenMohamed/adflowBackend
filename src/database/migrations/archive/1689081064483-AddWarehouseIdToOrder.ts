/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWarehouseIdToOrder1689081064483 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table orders
            add column warehouse_id integer default null,
            add foreign key (warehouse_id) references warehouse (id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
