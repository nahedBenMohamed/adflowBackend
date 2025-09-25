/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBoard1668679480636 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table board
        (
            id         integer      not null
                primary key,
            name       varchar(100) not null,
            type       varchar(50)  not null,
            record_id  bigint       not null,
            account_id integer      not null
                references account on delete cascade,
            created_at timestamp    not null
        );
    `);
    queryRunner.query(`create sequence board_id_seq as integer minvalue 14022001;`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
