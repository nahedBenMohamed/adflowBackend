/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeFileInfoHash1685001497108 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table file_info
        drop column hash_md5,
        add column hash_sha256 character varying;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
