/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderStatus1688138872050 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table order_status
        (
            id         integer,
            name       varchar(255) not null,
            color      varchar(50)  not null,
            code       varchar(50),
            sort_order smallint     not null,
            account_id integer      not null,
            primary key (id),
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence order_status_id_seq as integer minvalue 1;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
