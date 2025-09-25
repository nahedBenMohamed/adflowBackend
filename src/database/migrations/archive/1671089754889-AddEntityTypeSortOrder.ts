/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEntityTypeSortOrder1671089754889 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table entity_type add column sort_order smallint not null default 0;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
