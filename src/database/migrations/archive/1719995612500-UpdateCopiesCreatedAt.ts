/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCopiesCreatedAt1719995612500 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
WITH RECURSIVE entity_hierarchy AS (
    -- Base case: Select the initial entities
    SELECT 
        id,
        created_at,
        copied_from
    FROM 
        entity
    WHERE 
        copied_from IS NULL

    UNION ALL

    -- Recursive case: Join the entity table to build the hierarchy
    SELECT 
        e.id,
        eh.created_at,
        e.copied_from
    FROM 
        entity e
    INNER JOIN 
        entity_hierarchy eh
    ON 
        e.copied_from = eh.id
)
UPDATE 
    entity e1
SET 
    created_at = eh.created_at
FROM 
    entity_hierarchy eh
WHERE 
    e1.id = eh.id
AND 
    e1.copied_from IS NOT NULL;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
