/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveEntityListSettings1734352488667 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop sequence if exists entity_list_settings_id_seq;
      drop table if exists entity_list_settings;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
