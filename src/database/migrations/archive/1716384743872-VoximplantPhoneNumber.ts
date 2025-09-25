/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class VoximplantPhoneNumber1716384743872 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE voximplant_number RENAME COLUMN number TO phone_number;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
