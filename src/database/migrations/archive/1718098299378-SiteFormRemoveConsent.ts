/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SiteFormRemoveConsent1718098299378 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table site_form
        drop column consent_enabled,
        drop column consent_text,
        drop column consent_url;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
