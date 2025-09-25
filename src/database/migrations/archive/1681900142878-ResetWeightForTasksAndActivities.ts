/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ResetWeightForTasksAndActivities1681900142878 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      WITH ordered_tasks AS (
        SELECT
          id,
          ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY created_at DESC) * 100 AS new_weight
        FROM
          all_tasks
      )
      UPDATE activity
      SET weight = ordered_tasks.new_weight
      FROM ordered_tasks
      WHERE activity.id = ordered_tasks.id;
      WITH ordered_tasks AS (
        SELECT
          id,
          ROW_NUMBER() OVER (PARTITION BY account_id ORDER BY created_at DESC) * 100 AS new_weight
        FROM
          all_tasks
      )
      UPDATE task
      SET weight = ordered_tasks.new_weight
      FROM ordered_tasks
      WHERE task.id = ordered_tasks.id;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
