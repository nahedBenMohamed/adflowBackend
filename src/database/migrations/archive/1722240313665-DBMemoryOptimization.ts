/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DBMemoryOptimization1722240313665 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      SET work_mem = '64MB';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
