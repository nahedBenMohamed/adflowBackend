/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertSubscriptionDiscount1737103855502 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      insert into subscription_discount(days, percent, code) values(5, 50, 'discount_50');
      insert into subscription_discount(days, percent, code) values(19, 30, 'discount_30');
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
