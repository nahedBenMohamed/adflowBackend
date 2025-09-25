/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveModule1690467527775 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop table account_module;
      drop table module;
      drop sequence module_id_seq;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
