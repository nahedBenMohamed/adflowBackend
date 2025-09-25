/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FillResolvedDateForTaskAndAction1678367411991 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update task set resolved_date = now() where is_resolved = true and resolved_date is null;

      update activity set resolved_date = now() where is_resolved = true and resolved_date is null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
