/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAutomationProcess1718798058177 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table automation_process rename column external_id to resource_key;
      alter table automation_process
        drop column type,
        drop column is_active,
        add column bpmn_process_id text;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
