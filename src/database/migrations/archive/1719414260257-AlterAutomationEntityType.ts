/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAutomationEntityType1719414260257 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table automation_entity_type add column conditions jsonb;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
