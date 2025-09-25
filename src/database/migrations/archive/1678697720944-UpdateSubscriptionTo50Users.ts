/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSubscriptionTo50Users1678697720944 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update subscription set user_limit = 50;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
