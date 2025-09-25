/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterVoximplantSipName1724657864701 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table voximplant_sip add column name text;
      update voximplant_sip set name = external_id;
      alter table voximplant_sip alter column name set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
