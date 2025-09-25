/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterObjectPermissionIndices1728984932906 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS object_permission_object_type_object_id_idx;

      CREATE INDEX object_permission_account_id_user_id_idx ON object_permission(account_id, user_id);

      CREATE INDEX object_permission_account_user_type_id_idx 
        ON object_permission(account_id, user_id, object_type, object_id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
