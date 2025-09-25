/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class TestAccount1706795467082 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table test_account (
        account_id integer,
        primary key (account_id),
        foreign key (account_id) references account(id) on delete cascade
      );  
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
