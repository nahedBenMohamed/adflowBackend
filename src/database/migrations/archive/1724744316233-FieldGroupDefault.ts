/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FieldGroupDefault1724744316233 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      with first_group as (
          select id
          from field_group
          where (entity_type_id, sort_order) in (
              select entity_type_id, min(sort_order)
              from field_group
              group by entity_type_id
          )
      )
      update field_group
      set code = 'details'
      where id in (select id from first_group);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
