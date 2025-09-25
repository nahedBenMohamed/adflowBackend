/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveOldAutomation1738660778536 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop table if exists automation_stage;
      drop table if exists automation_condition;
      drop table if exists automation;
      drop table if exists action_activity_settings;
      drop table if exists action_task_settings;
      drop table if exists action_entity_settings;
      drop table if exists action_email_settings;
      drop table if exists action_scheduled;
      drop table if exists scheduled_mail_message;
      drop table if exists action;
      drop table if exists exact_time_trigger_settings;
      drop table if exists trigger;
      drop table if exists user_condition;
      drop table if exists field_condition;
      drop table if exists condition;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
