/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUser1667743637921 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table users
        (
            id         integer      not null
                primary key,
            name       varchar(255) not null,
            email      varchar(254) not null
                unique,
            password   varchar(100) not null,
            created_at timestamp    not null
        );
    `);
    queryRunner.query(`create sequence user_id_seq as integer minvalue 12022001;`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
