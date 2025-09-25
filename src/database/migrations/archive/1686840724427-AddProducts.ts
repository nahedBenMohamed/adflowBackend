/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProducts1686840724427 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table product_category
        (
            id         integer,
            name       character varying not null,
            parent_id  integer,
            created_by integer           not null,
            account_id integer           not null,
            created_at timestamp without time zone not null,
            primary key (id),
            foreign key (parent_id) references product_category (id),
            foreign key (created_by) references users (id),
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence product_category_id_seq as integer minvalue 1;

        create table product
        (
            id          integer,
            name        character varying not null,
            description character varying,
            sku         character varying,
            unit        character varying,
            tax         smallint,
            isDeleted   boolean           not null,
            category_id integer,
            created_by  integer           not null,
            account_id  integer           not null,
            created_at  timestamp without time zone not null,
            primary key (id),
            foreign key (category_id) references product_category (id),
            foreign key (created_by) references users (id),
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence product_id_seq as integer minvalue 1;

        create table product_price
        (
            id         integer,
            name       character varying,
            unit_price integer,
            currency   character varying(3) not null,
            product_id integer              not null,
            account_id integer              not null,
            primary key (id),
            foreign key (product_id) references product (id) on delete cascade,
            foreign key (account_id) references account (id) on delete cascade
        );
        create sequence product_price_id_seq as integer minvalue 1;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
