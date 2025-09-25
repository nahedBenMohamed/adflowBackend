/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldGroup1669126197933 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table field_group
        (
            id             integer      not null
                primary key,
            name           varchar(100) not null,
            sort_order     smallint     not null,
            entity_type_id integer      not null
                references entity_type (id) on delete cascade,
            account_id     integer      not null
                references account (id) on delete cascade,
            created_at     timestamp without time zone not null
        );
        create sequence field_group_id_seq as integer minvalue 41022001;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
