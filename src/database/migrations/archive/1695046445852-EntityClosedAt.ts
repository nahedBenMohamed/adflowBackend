/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EntityClosedAt1695046445852 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table entity add column closed_at timestamp without time zone;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
