/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldOption1669197308978 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table field_option
        (
            id         integer      not null
                primary key,
            label      varchar(255) not null,
            sort_order smallint     not null,
            field_id   integer      not null
                references field (id) on delete cascade,
            account_id integer      not null
                references account (id) on delete cascade,
            created_at timestamp without time zone not null
        );
        create sequence field_option_id_seq as integer minvalue 43022001;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
