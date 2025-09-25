/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultNotificationSettings1678194605837 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    insert into notification_settings
      select nextval('notification_settings_id_seq'::regclass) as id, account_id, id as user_id, true as enable_popup
      from users;
    insert into notification_type_settings
      select nextval('notification_type_settings_id_seq'::regclass) as id, account_id, id as settings_id, 'task_new' as type, true as is_enabled, null as object_id, null as before
      from notification_settings;
    insert into notification_type_settings
      select nextval('notification_type_settings_id_seq'::regclass) as id, account_id, id as settings_id, 'task_overdue' as type, true as is_enabled, null as object_id, null as before
      from notification_settings;
    insert into notification_type_settings
      select nextval('notification_type_settings_id_seq'::regclass) as id, account_id, id as settings_id, 'task_before_start' as type, true as is_enabled, null as object_id, 3600 as before
      from notification_settings;
    insert into notification_type_settings
      select nextval('notification_type_settings_id_seq'::regclass) as id, account_id, id as settings_id, 'task_overdue_employee' as type, false as is_enabled, null as object_id, null as before
      from notification_settings;
    insert into notification_type_settings
      select nextval('notification_type_settings_id_seq'::regclass) as id, account_id, id as settings_id, 'activity_new' as type, true as is_enabled, null as object_id, null as before
      from notification_settings;
    insert into notification_type_settings
      select nextval('notification_type_settings_id_seq'::regclass) as id, account_id, id as settings_id, 'activity_overdue' as type, true as is_enabled, null as object_id, null as before
      from notification_settings;
    insert into notification_type_settings
      select nextval('notification_type_settings_id_seq'::regclass) as id, account_id, id as settings_id, 'activity_before_start' as type, true as is_enabled, null as object_id, 3600 as before
      from notification_settings;
    insert into notification_type_settings
      select nextval('notification_type_settings_id_seq'::regclass) as id, account_id, id as settings_id, 'activity_overdue_employee' as type, false as is_enabled, null as object_id, null as before
      from notification_settings;	
    insert into notification_type_settings
      select nextval('notification_type_settings_id_seq'::regclass) as id, account_id, id as settings_id, 'task_comment_new' as type, true as is_enabled, null as object_id, null as before
      from notification_settings;
    insert into notification_type_settings
      select nextval('notification_type_settings_id_seq'::regclass) as id, account_id, id as settings_id, 'chat_message_new' as type, true as is_enabled, null as object_id, null as before
      from notification_settings;
    insert into notification_type_settings
      select nextval('notification_type_settings_id_seq'::regclass) as id, account_id, id as settings_id, 'mail_new' as type, true as is_enabled, null as object_id, null as before
      from notification_settings;
    insert into notification_type_settings
      select nextval('notification_type_settings_id_seq'::regclass) as id, account_id, id as settings_id, 'entity_note_new' as type, true as is_enabled, null as object_id, null as before
      from notification_settings;
    insert into notification_type_settings
      select nextval('notification_type_settings_id_seq'::regclass) as id, account_id, id as settings_id, 'entity_responsible_change' as type, true as is_enabled, null as object_id, null as before
      from notification_settings;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
