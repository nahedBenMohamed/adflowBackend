/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1682589692981 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX task_is_resolved_responsible_user_id_start_date_idx
      ON task (is_resolved, responsible_user_id, start_date);
    
      CREATE INDEX activity_is_resolved_responsible_user_id_start_date_idx
      ON activity (is_resolved, responsible_user_id, start_date);

      CREATE INDEX notification_type_settings_settings_id_type_is_enabled_idx
      ON notification_type_settings (settings_id, type, is_enabled);

      CREATE INDEX mailbox_folder_account_id_mailbox_id_idx
      ON mailbox_folder (account_id, mailbox_id);

      CREATE INDEX field_value_entity_id_idx ON field_value(entity_id);

      CREATE INDEX field_option_field_id_idx ON field_option(field_id);

      CREATE INDEX entity_link_source_id_sort_order_id_idx ON entity_link(source_id, sort_order, id);

    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
