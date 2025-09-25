/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSubscriptionDiscount1737971712981 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table subscription_discount add column valid_until timestamp without time zone;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
