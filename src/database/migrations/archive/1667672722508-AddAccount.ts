/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccount1667672722508 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table account
        (
            id           integer      not null
                constraint accounts_pkey primary key,
            company_name varchar(255) not null,
            subdomain    varchar(255) not null
                constraint accounts_subdomain_key unique,
            created_at   timestamp    not null
        );
    `);
    queryRunner.query(`create sequence account_id_seq as integer minvalue 11023201;`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
