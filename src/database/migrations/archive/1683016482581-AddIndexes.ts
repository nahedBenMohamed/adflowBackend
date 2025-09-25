/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1683016482581 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX task_is_resolved_end_date_idx ON task(is_resolved, end_date);
      CREATE INDEX task_entity_id_is_resolved_created_by_idx ON task(entity_id int4_ops, is_resolved bool_ops, created_by int4_ops);

      CREATE INDEX activity_is_resolved_end_date_idx ON activity(is_resolved, end_date);

      CREATE INDEX scheduled_action_scheduled_time_completed_idx ON scheduled_action(scheduled_time, completed);

      CREATE INDEX field_entity_type_id_type_idx ON field(entity_type_id int4_ops, type text_ops);
      CREATE INDEX entity_entity_type_id_stage_id_idx ON entity(entity_type_id int4_ops, stage_id int4_ops);

      CREATE INDEX user_object_permission_user_id_object_permission_id_idx ON user_object_permission(user_id int4_ops, object_permission_id int4_ops);
      CREATE INDEX object_permission_object_type_object_id_idx ON object_permission(object_type text_ops, object_id int4_ops);

      CREATE INDEX notification_settings_user_id_idx ON notification_settings(user_id int4_ops);

      CREATE INDEX users_account_id_department_id_idx ON users(account_id int4_ops, department_id int4_ops);

      CREATE INDEX subtask_account_id_task_id_idx ON subtask(account_id int4_ops, task_id int4_ops);

      CREATE INDEX file_link_account_id_source_type_source_id_idx ON file_link(account_id int4_ops, source_type text_ops, source_id int4_ops);

      CREATE INDEX stage_board_id_idx ON stage(board_id int4_ops);

      CREATE INDEX board_account_id_idx ON board(account_id int4_ops);
      CREATE INDEX board_type_idx ON board(type text_ops);

      CREATE INDEX note_entity_id_idx ON note(entity_id int4_ops);
      CREATE INDEX task_entity_id_idx ON task(entity_id int4_ops);
      CREATE INDEX activity_entity_id_idx ON activity(entity_id int4_ops);
      CREATE INDEX mail_message_entity_id_idx ON mail_message(entity_id int4_ops);
      CREATE INDEX entity_link_target_id_idx ON entity_link(target_id int4_ops);
      CREATE INDEX entity_link_source_id_idx ON entity_link(source_id int4_ops);

      CREATE INDEX department_account_id_parent_id_idx ON department(account_id int4_ops, parent_id int4_ops);

      CREATE INDEX exact_time_trigger_settings_date_idx ON exact_time_trigger_settings(date timestamp_ops);

      CREATE INDEX notification_account_user_seen_idx ON notification(account_id, user_id, is_seen);

      CREATE INDEX field_value_account_id_idx ON field_value(account_id);

    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
