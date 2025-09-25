/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSubscriptionDiscount1737973113027 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update subscription_discount set valid_until = now();

      insert into subscription_discount (days, percent, code, valid_until) values
      (5, 80, 'discount_80', null),
      (103, 70, 'discount_70', null),
      (403, 65, 'discount_65', null);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
