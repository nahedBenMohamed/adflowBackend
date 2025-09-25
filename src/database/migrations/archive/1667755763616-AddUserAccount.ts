/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAccount1667755763616 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table user_account
        (
            id         integer      not null
                primary key,
            user_id    integer      not null
                references users on delete cascade,
            account_id integer      not null
                references account on delete cascade,
            role       varchar(100) not null,
            created_at timestamp    not null,
            constraint user_account__user_id__account_id__uniq
                unique (user_id, account_id)
        );
    `);
    queryRunner.query(`create sequence user_account_id_seq as integer minvalue 12022001;`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
