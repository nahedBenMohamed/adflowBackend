/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskSettingsIdToTask1675090441216 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table task
            add column settings_id integer;
        alter table task
            add foreign key (settings_id) references task_settings (id)
                on delete set null;

        drop view all_tasks;
        create
        or replace view all_tasks (
            id, 
            created_at,
            account_id,
            created_by,
            responsible_user_id,
            text,
            start_date,
            end_date,
            is_resolved,
            result,
            entity_id,
            activity_type_id,
            title,
            planned_time,
            settings_id,
            type
        ) as
        select id,
               created_at,
               account_id,
               created_by,
               responsible_user_id,
               text,
               start_date,
               end_date,
               is_resolved,
               result,
               entity_id,
               activity_type_id,
               null       as title,
               null       as planned_time,
               null       as settings_id,
               'activity' as type
        from activity
        union
        select id,
               created_at,
               account_id,
               created_by,
               responsible_user_id,
               text,
               start_date,
               end_date,
               is_resolved,
               result,
               entity_id,
               null   as activity_type_id,
               title,
               planned_time,
               settings_id,
               'task' as type
        from task
        order by id;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
