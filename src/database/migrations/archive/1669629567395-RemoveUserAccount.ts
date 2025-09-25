/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUserAccount1669629567395 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table users
        add column account_id integer,
        add column role character varying(100),
        add column avatar_url character varying(256),
        add foreign key (account_id) references account(id) on delete cascade;
      
      update users set (account_id, role) =
        (select account_id, role from user_account where user_account.user_id = users.id);
          
      alter table users
        alter column account_id set not null,
        alter column role set not null;
        
      alter table users
        alter column last_name drop not null;
      
      drop table user_account;
      drop sequence user_account_id_seq;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
