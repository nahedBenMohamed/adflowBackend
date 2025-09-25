/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentTemplateGenerated1683797890507 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table document_template add column created_count integer NOT NULL DEFAULT 0;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
