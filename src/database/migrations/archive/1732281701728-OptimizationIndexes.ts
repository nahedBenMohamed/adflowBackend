/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizationIndexes1732281701728 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS users_accessible_users_user_id_idx ON users_accessible_users(user_id);

      CREATE INDEX IF NOT EXISTS board_record_id_idx ON board(record_id);
      CREATE INDEX IF NOT EXISTS stage_board_id_account_id_idx ON board_stage(board_id, account_id);

      CREATE INDEX IF NOT EXISTS field_option_field_id_account_id_idx ON field_option (field_id, account_id);
      DROP INDEX IF EXISTS field_option_field_id_idx;

      CREATE INDEX IF NOT EXISTS idx_field_value_partial_type_value ON field_value (entity_id, payload) WHERE field_type = 'value';

      CREATE INDEX IF NOT EXISTS idx_task_resolved_end_date ON task (account_id, is_resolved, end_date);
      CREATE INDEX IF NOT EXISTS idx_account_entity_resolved_true ON task (account_id, is_resolved, entity_id) WHERE is_resolved = true;

      CREATE INDEX IF NOT EXISTS idx_field_value_payload ON field_value USING gin (payload);

      CREATE INDEX IF NOT EXISTS idx_voximplant_call_account_created_at ON voximplant_call (account_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_voximplant_call_account_status_direction_user ON voximplant_call (account_id, status, direction, user_id);
      CREATE INDEX IF NOT EXISTS idx_voximplant_call_account_status ON voximplant_call (account_id, status);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
