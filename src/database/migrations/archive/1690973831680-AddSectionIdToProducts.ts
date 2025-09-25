/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSectionIdToProducts1690973831680 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table product
        add column section_id integer,
        add foreign key (section_id) references products_section(id) on delete cascade;
      update product p set section_id = ps.id from products_section ps where p.account_id = ps.account_id;
      alter table product alter column section_id set not null;

      alter table product_category
        add column section_id integer,
        add foreign key (section_id) references products_section(id) on delete cascade;
      update product_category pc set section_id = ps.id from products_section ps where pc.account_id = ps.account_id;
      alter table product_category alter column section_id set not null;

      alter table warehouse
        add column section_id integer,
        add foreign key (section_id) references products_section(id) on delete cascade;
      update warehouse w set section_id = ps.id from products_section ps where w.account_id = ps.account_id;
      alter table warehouse alter column section_id set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
