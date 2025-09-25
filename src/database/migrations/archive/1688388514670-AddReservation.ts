/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddReservation1688388514670 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table reservation
        (
            id            integer,
            order_id      integer not null,
            order_item_id integer not null,
            product_id    integer not null,
            warehouse_id  integer not null,
            quantity      integer not null,
            account_id    integer not null,
            created_at    timestamp without time zone not null,
            primary key (id),
            foreign key (order_id) references orders (id) on delete cascade,
            foreign key (order_item_id) references order_item (id) on delete cascade,
            foreign key (product_id) references product (id),
            foreign key (warehouse_id) references warehouse (id),
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence reservation_id_seq as integer minvalue 1;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
