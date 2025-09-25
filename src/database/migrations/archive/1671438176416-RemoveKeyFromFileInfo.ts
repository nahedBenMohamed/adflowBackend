/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveKeyFromFileInfo1671438176416 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table file_info drop column key;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
