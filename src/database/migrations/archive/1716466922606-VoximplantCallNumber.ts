/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class VoximplantCallNumber1716466922606 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE voximplant_call
        ADD COLUMN number_id integer,
        ADD FOREIGN KEY (number_id) REFERENCES voximplant_number(id) ON DELETE SET NULL;  
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
