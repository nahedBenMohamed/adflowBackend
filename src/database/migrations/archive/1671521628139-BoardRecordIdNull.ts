/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class BoardRecordIdNull1671521628139 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table board alter column record_id drop not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
