/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsDeletedToWarehouse1687965328992 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table warehouse
            add column is_deleted boolean not null default false;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
