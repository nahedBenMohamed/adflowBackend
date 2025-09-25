/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class VoximplantAccount1697541300418 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from voximplant_account;
      
      alter table voximplant_account
        add column external_id integer not null,
        add column api_key character varying not null,
        add column password character varying not null,
        add column billing_account_id integer not null,
        add column is_active text not null default false;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
