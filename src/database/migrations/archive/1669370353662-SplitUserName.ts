/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class SplitUserName1669370353662 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table users
      add column first_name character varying(255),
      add column last_name character varying(255);
      
      update users set first_name =  split_part(name, ' ', 1), last_name = split_part(name, ' ', 2);
      
      alter table users
      alter column first_name set not null,
      alter column last_name set not null;

      alter table users drop column name;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
