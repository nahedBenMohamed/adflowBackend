/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTasksView1669210346088 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create or replace view all_tasks (id, created_at, account_id, created_by, responsible_user_id, text, start_date, end_date, is_resolved, result, entity_id, task_type_id, title, type) as
      select id, created_at, account_id, created_by, responsible_user_id, text, start_date, end_date, is_resolved, result, entity_id, task_type_id, null as title, 'activity' as type from activity
      union
      select id, created_at, account_id, created_by, responsible_user_id, text, start_date, end_date, is_resolved, result, entity_id, null as task_type_id, title, 'task' as type from task
      order by id;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
