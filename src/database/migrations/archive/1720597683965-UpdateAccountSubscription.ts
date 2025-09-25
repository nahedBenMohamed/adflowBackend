/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAccountSubscription1720597683965 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update account_subscription set plan_name = 'All in One' where plan_name = 'Premium';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
