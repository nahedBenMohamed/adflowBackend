/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class VoximplantCallAlterExternalId1697702819805 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from voximplant_call;

      alter table voximplant_call
        drop column external_id,
        add column session_id character varying not null,
        add column call_id character varying not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
