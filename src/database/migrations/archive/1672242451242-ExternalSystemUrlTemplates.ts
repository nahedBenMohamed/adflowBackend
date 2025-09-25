/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ExternalSystemUrlTemplates1672242451242 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table external_system add column url_templates character varying[];

      update external_system set url_templates='{salesforce.com,force.com}' where id=1;
      update external_system set url_templates='{linkedin.com}' where id=2;
      update external_system set url_templates='{facebook.com, fb.com}' where id=3;

      alter table external_system alter column url_templates set not null;

      alter table external_system drop column url_template;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
