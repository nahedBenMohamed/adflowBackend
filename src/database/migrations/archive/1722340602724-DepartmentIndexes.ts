/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DepartmentIndexes1722340602724 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX idx_department_id_account_id ON department(id, account_id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
