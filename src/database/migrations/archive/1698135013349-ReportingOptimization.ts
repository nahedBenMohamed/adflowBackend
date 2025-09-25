/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ReportingOptimization1698135013349 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX idx_entity_account_id_stage_id_closed_at ON entity(account_id, stage_id, closed_at);
      CREATE INDEX idx_field_value_entity_id_field_type ON field_value(entity_id, field_type);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
