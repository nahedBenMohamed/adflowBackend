/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FixStatusIdInOrder1688394200229 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table orders
            alter column status_id set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
