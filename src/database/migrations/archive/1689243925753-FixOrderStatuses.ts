/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FixOrderStatuses1689243925753 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        update order_status
        set name       = 'Reserved',
            color      = '#FFE385',
            code       = 'reserved',
            sort_order = 0
        where code = 'pending';

        update order_status
        set name       = 'Sent for shipment',
            color      = '#A7DFDC',
            code       = 'sent_for_shipment',
            sort_order = 1
        where code = 'confirmed';

        update order_status
        set color      = '#A8E379',
            sort_order = 2
        where code = 'shipped';

        update order_status
        set color      = '#FC7483',
            sort_order = 3
        where code = 'cancelled';

        update order_status
        set name       = 'Returned',
            code       = 'returned',
            color      = '#DCDDE0',
            sort_order = 4
        where code = 'completed';

        update orders
        set status_id = (select id from order_status where code = 'reserved' and account_id = orders.account_id)
        where status_id = (select id
                           from order_status
                           where code = 'delivered'
                             and account_id = orders.account_id);

        delete
        from order_status
        where code = 'delivered';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
