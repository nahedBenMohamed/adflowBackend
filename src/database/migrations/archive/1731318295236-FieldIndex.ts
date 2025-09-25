/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FieldIndex1731318295236 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS field_account_entity_type_sort_order_idx
        ON field (account_id, entity_type_id, sort_order);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
