/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEntityType1668609239887 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table entity_type
        (
            id           integer      not null
                primary key,
            name         varchar(255) not null,
            card_view    varchar(50)  not null,
            section_name varchar(100) not null,
            section_view varchar(50)  not null,
            section_icon varchar(50)  not null,
            account_id   integer      not null
                references account on delete cascade,
            created_at   timestamp    not null
        );
    `);
    queryRunner.query(`create sequence entity_type_id_seq as integer minvalue 13022001;`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
