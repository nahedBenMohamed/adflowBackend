/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class OrderCancelAfter1710758264055 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table orders
        add column updated_at timestamp without time zone,
        add column cancel_after integer;

      update orders set updated_at = created_at;

      alter table orders alter column updated_at set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
