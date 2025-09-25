/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSectionIdToOrderAndShipment1691056504886 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table shipment
        add column section_id integer,
        add foreign key (section_id) references products_section(id) on delete cascade;
      update shipment s set section_id = ps.id from products_section ps where s.account_id = ps.account_id;
      alter table shipment alter column section_id set not null;

      alter table orders
        add column section_id integer,
        add foreign key (section_id) references products_section(id) on delete cascade;
      update orders o set section_id = ps.id from products_section ps where o.account_id = ps.account_id;
      alter table orders alter column section_id set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
