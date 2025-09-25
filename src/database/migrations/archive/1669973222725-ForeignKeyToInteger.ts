/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ForeignKeyToInteger1669973222725 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    drop view all_tasks;
    drop view feed_items;
    
    alter table activity alter column entity_id type integer;
    alter table board alter column record_id type integer;
    alter table entity_link alter column source_id type integer;
    alter table entity_link alter column target_id type integer;
    alter table entity_link alter column back_link_id type integer;
    alter table field_value alter column entity_id type integer;
    alter table note alter column entity_id type integer;
    alter table task alter column entity_id type integer;
    
    create or replace view all_tasks (id, created_at, account_id, created_by, responsible_user_id, text, start_date, end_date, is_resolved, result, entity_id, task_type_id, title, type) as
    select id, created_at, account_id, created_by, responsible_user_id, text, start_date, end_date, is_resolved, result, entity_id, task_type_id, null as title, 'activity' as type from activity
    union
    select id, created_at, account_id, created_by, responsible_user_id, text, start_date, end_date, is_resolved, result, entity_id, null as task_type_id, title, 'task' as type from task
    order by id;
    
    create or replace view feed_items (id, created_at, entity_id, type) as 
      select id, created_at, entity_id, 'note' as type from note
      union
      select id, created_at, entity_id, 'task' as type from task
      union
      select id, created_at, entity_id, 'activity' as type from activity
    order by created_at desc;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
