/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUpdatedAtToProduct1689774963182 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table product
            add column updated_at timestamp without time zone default now();
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
