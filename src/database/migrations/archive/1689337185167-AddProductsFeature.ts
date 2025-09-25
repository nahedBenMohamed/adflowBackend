/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductsFeature1689337185167 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        insert into feature(name, code, is_enabled) values('Products', 'products', true);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
