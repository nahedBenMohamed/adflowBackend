/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ScheduledAction1711706670268 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table scheduled_action rename to action_scheduled;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
