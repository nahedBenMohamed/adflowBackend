/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EntityCopiedCount1710162901881 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table entity add column copied_count integer;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
