/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAutomationEntityType1728471228996 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table automation_entity_type
        drop constraint automation_entity_type_entity_type_id_fkey,
        alter column entity_type_id drop not null,
        drop constraint automation_entity_type_board_id_fkey,
        drop constraint automation_entity_type_stage_id_fkey;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
