/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationHighlight1677744619246 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table notification add column highlight character varying;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
