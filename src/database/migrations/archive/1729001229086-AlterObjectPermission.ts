/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterObjectPermission1729001229086 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table object_permission add column dashboard_permission text;

      update object_permission set dashboard_permission = edit_permission;

      alter table object_permission alter column dashboard_permission set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
