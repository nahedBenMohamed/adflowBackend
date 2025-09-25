/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class IndexOptimization1732697048964 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
CREATE INDEX IF NOT EXISTS idx_entity_account_entity_type_stage_weight_id ON entity (account_id, entity_type_id, stage_id, weight ASC, id DESC);
ANALYZE entity;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
