/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameSubscription1720531175011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table subscription rename to account_subscription;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
