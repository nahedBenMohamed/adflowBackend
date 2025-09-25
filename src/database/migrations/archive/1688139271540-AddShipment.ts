/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShipment1688139271540 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table shipment_status
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
        create sequence shipment_status_id_seq as integer minvalue 1;

        create table shipment
        (
            id           integer,
            name         varchar(255) not null,
            warehouse_id integer      not null,
            order_id     integer      not null,
            status_id    integer      not null,
            account_id   integer      not null,
            created_at   timestamp without time zone not null,
            primary key (id),
            foreign key (warehouse_id) references warehouse (id),
            foreign key (order_id) references orders (id),
            foreign key (status_id) references shipment_status (id),
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence shipment_id_seq as integer minvalue 1;

        create table shipment_item
        (
            id          integer,
            shipment_id integer not null,
            product_id  integer not null,
            quantity    integer not null,
            account_id  integer not null,
            primary key (id),
            foreign key (shipment_id) references shipment (id) on delete cascade,
            foreign key (product_id) references product (id),
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence shipment_item_id_seq as integer minvalue 1;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
