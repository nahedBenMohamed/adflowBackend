/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class VoximplantCallNumberDefault1716469802549 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update voximplant_call set number_id = (
        select id from voximplant_number where voximplant_number.account_id = voximplant_call.account_id limit 1
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
