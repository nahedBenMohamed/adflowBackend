/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EntityTypeLinkOrphans1732783039132 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO entity_type_link (source_id, target_id, account_id, sort_order)
      SELECT etl1.target_id AS source_id,
            etl1.source_id AS target_id,
            etl1.account_id,
            etl1.sort_order
      FROM entity_type_link etl1
      LEFT JOIN entity_type_link etl2
        ON etl1.source_id = etl2.target_id
        AND etl1.target_id = etl2.source_id
      WHERE etl2.id IS NULL;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
