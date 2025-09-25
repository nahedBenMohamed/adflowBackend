/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddField1669127718002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table field
        (
            id             integer      not null
                primary key,
            name           varchar(100) not null,
            type           varchar(50)  not null,
            sort_order     smallint     not null,
            entity_type_id integer      not null
                references entity_type (id) on delete cascade,
            field_group_id integer      not null
                references field_group (id) on delete cascade,
            account_id     integer      not null
                references account (id) on delete cascade,
            created_at     timestamp without time zone not null
        );
        create sequence field_id_seq as integer minvalue 42022001;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
