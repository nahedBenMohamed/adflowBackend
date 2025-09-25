/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrder1687790975332 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table orders
        (
            id           integer,
            total_amount numeric(13, 2)       not null,
            currency     character varying(3) not null,
            entity_id    integer              not null,
            created_by   integer              not null,
            account_id   integer              not null,
            created_at   timestamp without time zone not null,
            primary key (id),
            foreign key (entity_id) references entity (id) on delete cascade,
            foreign key (created_by) references users (id),
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence order_id_seq as integer minvalue 1;

        create table order_item
        (
            id         integer,
            unit_price numeric(13, 2) not null,
            quantity   integer        not null,
            tax        numeric(3, 2)  not null,
            discount   numeric(3, 2)  not null,
            product_id integer        not null,
            order_id   integer        not null,
            sort_order smallint       not null,
            account_id integer        not null,
            primary key (id),
            foreign key (product_id) references product (id),
            foreign key (order_id) references orders (id) on delete cascade,
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence order_item_id_seq as integer minvalue 1;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
