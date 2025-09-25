/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCategoryIdConstraint1688996628275 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        alter table product
        drop constraint product_category_id_fkey;

        alter table product
            add foreign key (category_id) references product_category
                on delete set null;

    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
