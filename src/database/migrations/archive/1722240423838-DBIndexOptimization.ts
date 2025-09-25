/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DBIndexOptimization1722240423838 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX idx_entity_account_entity_type_id ON entity(account_id, entity_type_id, id);

      CREATE INDEX idx_entity_link_source_target_id ON entity_link(source_id, target_id);

      CREATE INDEX idx_field_value_entity_payload ON field_value USING gin (payload jsonb_path_ops);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
