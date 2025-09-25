/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUnusedIndexes1729853713049 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop index if exists entity_link_source_id_sort_order_id_idx;
      drop index if exists idx_field_value_entity_payload;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
