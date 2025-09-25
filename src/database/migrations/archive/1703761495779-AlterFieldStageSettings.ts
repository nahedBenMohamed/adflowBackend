/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterFieldStageSettings1703761495779 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table field_stage_settings drop column exclude_user_ids;
      alter table field_stage_settings add column exclude_user_ids integer[];
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
