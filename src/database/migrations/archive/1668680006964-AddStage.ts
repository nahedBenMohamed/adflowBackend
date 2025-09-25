/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStage1668680006964 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table stage
        (
            id         integer      not null
                primary key,
            name       varchar(100) not null,
            color      varchar(50)  not null,
            code       varchar(50),
            is_system  boolean      not null,
            sort_order smallint     not null,
            board_id   integer      not null
                references board on delete cascade,
            account_id integer      not null
                references account on delete cascade,
            created_at timestamp    not null
        );
    `);
    queryRunner.query(`create sequence stage_id_seq as integer minvalue 15022001;`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
