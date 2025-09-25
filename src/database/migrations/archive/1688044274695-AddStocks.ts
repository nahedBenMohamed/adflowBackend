/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStocks1688044274695 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table stock
        (
            product_id     integer not null,
            warehouse_id   integer not null,
            stock_quantity integer not null,
            account_id     integer not null,
            primary key (product_id, warehouse_id),
            foreign key (product_id) references product (id),
            foreign key (warehouse_id) references warehouse (id),
            foreign key (account_id) references account (id) on delete cascade
        );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
