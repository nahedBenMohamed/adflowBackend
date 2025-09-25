/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterEntityValue1734009141643 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table entity add column if not exists value numeric not null default 0;
      update entity
      set value = (
        select coalesce((payload->>'value')::numeric, 0) from (
          select distinct on (entity_id) payload
          from field_value
          where field_type = 'value' and entity_id = entity.id
          order by entity_id, created_at desc
        ) subquery
      )
      where exists (select 1 from field_value where field_type = 'value' and entity_id = entity.id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
