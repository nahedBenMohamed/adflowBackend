/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameProductField1686930758334 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table product
            rename column isdeleted to is_deleted;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
