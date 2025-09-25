/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFileStorePath1670939571185 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table file_info add column store_path character varying not null;
      alter table file_info add column hash_md5 character varying not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
