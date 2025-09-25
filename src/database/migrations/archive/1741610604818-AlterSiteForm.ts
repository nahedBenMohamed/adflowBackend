/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSiteForm1741610604818 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table site_form rename column deduplicate_linked to check_duplicate;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
