/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterObjectPermission1728988723314 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table object_permission
        alter column object_type type text,
        alter column create_permission type text,
        alter column view_permission type text,
        alter column edit_permission type text,
        alter column delete_permission type text,
        add column report_permission text;

      update object_permission set report_permission = edit_permission;

      alter table object_permission alter column report_permission set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
