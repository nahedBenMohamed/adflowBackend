/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEntityWeight1682002593036 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE entity ADD COLUMN weight double precision;

      WITH ordered_entity AS (
        SELECT
          e.id,
          ROW_NUMBER() OVER (PARTITION BY e.account_id, e.entity_type_id, s.board_id ORDER BY e.created_at DESC, e.id DESC) * 100 AS new_weight
        FROM
          entity e
        LEFT JOIN stage s ON e.stage_id = s.id
      )
      UPDATE entity
      SET weight = ordered_entity.new_weight
      FROM ordered_entity
      WHERE entity.id = ordered_entity.id;

      ALTER TABLE entity ALTER COLUMN weight SET NOT NULL;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
