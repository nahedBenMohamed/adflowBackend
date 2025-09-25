/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSiteForm1732866955213 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE site_form ADD COLUMN is_headless boolean NOT NULL DEFAULT false;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
