/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteShipmentStatus1689259268310 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table shipment drop column status_id;

        alter table shipment
            add column status_id integer,
                add foreign key (status_id) references order_status(id);

        update shipment
        set status_id = (select id
                         from order_status
                         where code = 'sent_for_shipment'
                           and account_id = shipment.account_id);

        alter table shipment
            alter column status_id set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
