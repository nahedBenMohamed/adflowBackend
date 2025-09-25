/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EntityTypeActionTypeRename1725008953241 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE automation_entity_type
      SET actions = replace(actions::text, '"create_task"', '"task_create"')::jsonb
      WHERE actions::text LIKE '%"create_task"%';

      UPDATE automation_entity_type
      SET actions = replace(actions::text, '"create_activity"', '"activity_create"')::jsonb
      WHERE actions::text LIKE '%"create_activity"%';

      UPDATE automation_entity_type
      SET actions = replace(actions::text, '"change_stage"', '"entity_stage_change"')::jsonb
      WHERE actions::text LIKE '%"change_stage"%';

      UPDATE automation_entity_type
      SET actions = replace(actions::text, '"send_email"', '"email_send"')::jsonb
      WHERE actions::text LIKE '%"send_email"%';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
