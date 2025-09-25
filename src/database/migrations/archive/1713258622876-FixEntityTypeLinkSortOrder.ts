/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEntityTypeLinkSortOrder1713258622876 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      WITH Sorted AS (
          SELECT id, row_number() OVER (PARTITION BY source_id ORDER BY id) - 1 AS new_sort_order
          FROM entity_type_link
      )
      UPDATE entity_type_link
      SET sort_order = Sorted.new_sort_order
      FROM Sorted
      WHERE entity_type_link.id = Sorted.id;  
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
