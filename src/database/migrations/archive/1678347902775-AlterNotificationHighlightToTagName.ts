/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterNotificationHighlightToTagName1678347902775 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table notification rename column highlight to tag_name; 
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
