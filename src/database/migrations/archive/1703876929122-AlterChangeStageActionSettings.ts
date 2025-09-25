/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChangeStageActionSettings1703876929122 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table change_stage_action_settings rename to entity_action_settings;
      alter index change_stage_action_settings_pkey rename to entity_action_settings_pkey;
      alter table entity_action_settings add column operation_type character varying not null default 'move';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
