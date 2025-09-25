/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeStartEndDateNullable1674741639286 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table task
            alter column start_date drop not null;
        alter table task
            alter column end_date drop not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
