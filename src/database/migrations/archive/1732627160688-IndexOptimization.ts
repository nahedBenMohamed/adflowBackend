/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class IndexOptimization1732627160688 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE INDEX IF NOT EXISTS idx_voximplant_user_account_user ON voximplant_user (account_id, user_id);
CREATE INDEX IF NOT EXISTS idx_order_status_account_sort ON order_status (account_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_demo_data_account ON demo_data (account_id);
CREATE INDEX IF NOT EXISTS idx_task_settings_account ON task_settings (account_id);
CREATE INDEX IF NOT EXISTS idx_activity_type_account_created ON activity_type (account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_entity_type_account_sort ON entity_type (account_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_mailbox_account_created ON mailbox (account_id, created_at);
CREATE INDEX IF NOT EXISTS idx_mailbox_accessible_user_account_mailbox ON mailbox_accessible_user (account_id, mailbox_id);


ANALYZE voximplant_user;
ANALYZE order_status;
ANALYZE demo_data;
ANALYZE task_settings;
ANALYZE activity_type;
ANALYZE mailbox;
ANALYZE entity_type;
ANALYZE mailbox_accessible_user;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
