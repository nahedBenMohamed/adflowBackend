/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class VoximplantAccountKey1697556130148 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table voximplant_account
        add column key_id character varying not null,
        add column private_key character varying not null;  
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
