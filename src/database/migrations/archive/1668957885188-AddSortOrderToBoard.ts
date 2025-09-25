/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSortOrderToBoard1668957885188 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('alter table board add column sort_order smallint not null default 0;');
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
