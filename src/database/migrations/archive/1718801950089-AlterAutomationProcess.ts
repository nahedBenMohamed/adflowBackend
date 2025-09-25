/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAutomationProcess1718801950089 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table automation_process
        add column name text not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
