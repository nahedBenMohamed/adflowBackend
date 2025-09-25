/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAutomationProcess1719393706903 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table automation_process rename column data to bpmn_file;
      alter table automation_process drop column name;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
