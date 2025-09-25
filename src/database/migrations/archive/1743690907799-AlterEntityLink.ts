/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterEntityLink1743690907799 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      with duplicates as (
        select id
        from (select id, row_number() over (partition by source_id, target_id order by id) as rn from entity_link) t
        where t.rn > 1
      )
      delete from entity_link where id in (select id from duplicates);

      alter table entity_link
        drop column id,
        add primary key (source_id, target_id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
