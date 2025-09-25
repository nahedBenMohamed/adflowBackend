/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStartsInToNotification1678963689149 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table notification add column starts_in integer;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
