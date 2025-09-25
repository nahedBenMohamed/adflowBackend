/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class VoximplantAccountAlter1697541767120 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table voximplant_account drop column is_active;
      alter table voximplant_account add column is_active boolean not null default false;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
