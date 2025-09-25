/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEntityBoardAndStage1732876120184 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
WITH cte_board AS (
    SELECT e.id AS entity_id, b.id AS board_id
    FROM entity e
    JOIN entity_type et ON et.id = e.entity_type_id and et.section_view = 'board'
    JOIN board b ON b.record_id = e.entity_type_id AND b.type = 'entity_type'
    WHERE et.section_view = 'board' AND e.board_id IS NULL AND e.stage_id IS NULL
    ORDER BY b.sort_order
),
cte_stage AS (
    SELECT cte_board.entity_id, bs.id AS stage_id
    FROM cte_board
    JOIN board_stage bs ON bs.board_id = cte_board.board_id
    ORDER BY bs.sort_order
)
UPDATE entity
SET board_id = cte_board.board_id, stage_id = cte_stage.stage_id
FROM cte_board
JOIN cte_stage ON cte_board.entity_id = cte_stage.entity_id
WHERE entity.id = cte_board.entity_id;

WITH cte_stage AS (
    SELECT e.id AS entity_id, bs.id AS stage_id
    FROM entity e
    JOIN board_stage bs ON bs.board_id = e.board_id
    WHERE e.stage_id IS NULL
    ORDER BY bs.sort_order
)
UPDATE entity
SET stage_id = cte_stage.stage_id
FROM cte_stage
WHERE entity.id = cte_stage.entity_id;

WITH cte_board AS (
    SELECT e.id AS entity_id, bs.board_id AS board_id
    FROM entity e
    JOIN board_stage bs ON e.stage_id = bs.id
    WHERE e.board_id IS NULL
)
UPDATE entity
SET board_id = cte_board.board_id
FROM cte_board
WHERE entity.id = cte_board.entity_id;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
