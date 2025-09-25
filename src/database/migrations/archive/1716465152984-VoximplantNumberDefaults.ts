/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class VoximplantNumberDefaults1716465152984 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO voximplant_number (account_id, phone_number, external_id)
        SELECT account_id, '', '' FROM voximplant_account;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
