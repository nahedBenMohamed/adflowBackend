/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class OptimizeNotificationIndexes1708952321460 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop index notification_type_settings_settings_id_type_is_enabled_idx;
      create index notification_type_settings_on_type_enabled_idx
        on notification_type_settings(type) where is_enabled = true;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
