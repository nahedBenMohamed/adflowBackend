/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EntityListSettingsIndex1722500514353 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX idx_entity_list_settings_account_entity_board 
        ON entity_list_settings(account_id, entity_type_id, board_id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
