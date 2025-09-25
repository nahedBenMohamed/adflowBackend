/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FixOrder1687793191931 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table orders
        alter column total_amount type numeric(15, 2) using total_amount::numeric(15, 2);

        alter table order_item
        alter column unit_price type numeric(15, 2) using tax::numeric(15, 2),
        alter column tax type numeric(5, 2) using tax::numeric(5, 2),
        alter column discount type numeric(5, 2) using tax::numeric(5, 2);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
