/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubscriptionExternalCustomerId1687351857599 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    alter table subscription add column external_customer_id character varying;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
