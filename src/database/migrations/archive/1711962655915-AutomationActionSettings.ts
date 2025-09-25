/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AutomationActionSettings1711962655915 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table action_settings_activity rename to action_activity_settings;
      alter table action_settings_email rename to action_email_settings;
      alter table action_settings_entity rename to action_entity_settings;
      alter table action_settings_task rename to action_task_settings;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
