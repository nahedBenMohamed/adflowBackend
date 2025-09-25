/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProjectFieldsSortOrder1722325875311 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        update field set sort_order = -1 where code is not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
