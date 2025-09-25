/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAutomationEntityType1719411072571 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table automation_entity_type add column delay integer;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
