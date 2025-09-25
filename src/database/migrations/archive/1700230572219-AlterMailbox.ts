/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMailbox1700230572219 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox add column create_lead boolean not null default false;

      update mailbox set create_lead = lead_entity_type_id is not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
