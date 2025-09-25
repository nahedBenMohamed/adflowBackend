/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterShipment1703850851646 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table shipment
        add column entity_id integer,
        add column order_number integer,
        add foreign key (entity_id) references entity(id) on delete cascade;

      update shipment set entity_id = (select entity_id from orders where orders.id = shipment.order_id);
      update shipment set order_number = (select order_number from orders where orders.id = shipment.order_id);

      alter table shipment
        alter column entity_id set not null,
        alter column order_number set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
