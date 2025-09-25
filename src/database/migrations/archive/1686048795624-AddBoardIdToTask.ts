/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBoardIdToTask1686048795624 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table task
            add column board_id integer,
            add foreign key (board_id) references board(id) on delete cascade;

        update task 
        set board_id = (select s.board_id from stage s where s.id = task.stage_id);

        drop view all_tasks;

        create or replace view all_tasks (
        id, 
        created_at,
        account_id,
        created_by,
        responsible_user_id,
        text,
        start_date,
        end_date,
        is_resolved,
        resolved_date,
        result,
        entity_id,
        weight,
        activity_type_id,
        title,
        planned_time,
        settings_id,
        board_id,
        stage_id,
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
               resolved_date,
               result,
               entity_id,
               weight,
               activity_type_id,
               null       as title,
               null       as planned_time,
               null       as settings_id,
               null       as board_id,
               null       as stage_id,
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
               resolved_date,
               null   as  result,
               entity_id,
               weight,
               null   as  activity_type_id,
               title,
               planned_time,
               settings_id,
               board_id,
               stage_id,
               'task' as type
        from task
        order by id;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
