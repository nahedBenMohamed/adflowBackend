/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWeightToTaskAndActivity1681828967422 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE activity ADD COLUMN weight double precision;
      WITH ordered_activity AS (
        SELECT
          id,
          ROW_NUMBER() OVER (ORDER BY created_at DESC) * 100 AS new_weight
        FROM
          activity
      )
      UPDATE activity
      SET weight = ordered_activity.new_weight
      FROM ordered_activity
      WHERE activity.id = ordered_activity.id;
      ALTER TABLE activity ALTER COLUMN weight SET NOT NULL;

      ALTER TABLE task ADD COLUMN weight double precision;
      WITH ordered_task AS (
        SELECT
          id,
          ROW_NUMBER() OVER (ORDER BY created_at DESC) * 100 AS new_weight
        FROM
          task
      )
      UPDATE task
      SET weight = ordered_task.new_weight
      FROM ordered_task
      WHERE task.id = ordered_task.id;
      ALTER TABLE task ALTER COLUMN weight SET NOT NULL;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
