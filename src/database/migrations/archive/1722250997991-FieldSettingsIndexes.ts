/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FieldSettingsIndexes1722250997991 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE INDEX idx_field_stage_settings_account_field_access ON field_stage_settings(account_id, field_id, access);
CREATE INDEX idx_field_stage_settings_account_field_stage_access ON field_stage_settings(account_id, field_id, stage_id, access);

CREATE INDEX idx_field_user_settings_account_field_access ON field_user_settings(account_id, field_id, access);
CREATE INDEX idx_field_user_settings_account_field_user_access ON field_user_settings(account_id, field_id, user_id, access);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
