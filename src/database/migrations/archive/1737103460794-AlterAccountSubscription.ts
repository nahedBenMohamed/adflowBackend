/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAccountSubscription1737103460794 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table account_subscription alter column first_visit set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
