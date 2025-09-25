/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSchedule1692975377102 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table schedule
        drop column use_product,
        add column products_section_id integer,
        add foreign key (products_section_id) references products_section(id) on delete set null;  
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
