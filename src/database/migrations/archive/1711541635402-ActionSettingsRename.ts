/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ActionSettingsRename1711541635402 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table activity_action_settings rename to action_settings_activity;
      alter table email_action_settings rename to action_settings_email;
      alter table entity_action_settings rename to action_settings_entity;
      alter table task_action_settings rename to action_settings_task;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
