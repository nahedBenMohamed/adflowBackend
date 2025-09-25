/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAccountSubscription1737103293642 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update account_subscription set first_visit = created_at;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
