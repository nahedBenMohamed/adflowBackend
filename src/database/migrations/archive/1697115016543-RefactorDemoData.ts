/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorDemoData1697115016543 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO demo_data (account_id, type, ids)
        SELECT account_id, 'entity' AS type, STRING_AGG(CAST(id AS character varying), ',') AS ids
        FROM entity WHERE is_demo = true GROUP BY account_id;
      ALTER TABLE entity DROP COLUMN is_demo;

      INSERT INTO demo_data (account_id, type, ids)
        SELECT account_id, 'user' AS type, STRING_AGG(CAST(id AS character varying), ',') AS ids
        FROM users WHERE is_demo = true GROUP BY account_id;
      ALTER TABLE users DROP COLUMN is_demo;

      ALTER TABLE account_settings DROP COLUMN has_demo;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
