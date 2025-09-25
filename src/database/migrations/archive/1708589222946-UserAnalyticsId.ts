/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAnalyticsId1708589222946 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create extension if not exists "uuid-ossp";
      alter table users add column analytics_id uuid;
      update users set analytics_id = uuid_generate_v4();
      alter table users alter column analytics_id set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
