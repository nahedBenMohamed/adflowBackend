/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExternalSystems1670846440118 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      insert into external_system(name, code, url_template) values('SalesForce', 'salesforce', 'salesforce.com');
      insert into external_system(name, code, url_template) values('LinkedIn', 'linkedin', 'www.linkedin.com');
      insert into external_system(name, code, url_template) values('Facebook', 'facebook', 'facebook.com');
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
