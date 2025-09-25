/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPlanNameToSubscription1678696011650 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table subscription add column plan_name character varying;
      update subscription set plan_name = 'Premium';
      alter table subscription alter column plan_name set NOT NULL;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
