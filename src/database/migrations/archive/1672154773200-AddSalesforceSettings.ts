/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSalesforceSettings1672154773200 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table salesforce_settings (
        id uuid default gen_random_uuid(),
        account_id integer not null,
        created_at timestamp without time zone not null,
        domain character varying not null,
        key character varying not null,
        secret character varying not null,
        primary key (id),
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
