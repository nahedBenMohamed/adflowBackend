/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ProductOrdersToEntityEvents1700741072037 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      insert into entity_event (account_id, entity_id, object_id, type, created_at)
        select
          o.account_id, 
          o.entity_id, 
          o.id as object_id, 
          'order'::text as type,
          o.created_at
        from orders o
        where o.entity_id is not null
        union
          select 
            ro.account_id,
            ro.entity_id, 
            ro.id as object_id, 
            'rental_order'::text as type,
            ro.created_at 
          from rental_order ro
          where ro.entity_id is not null
        order by created_at desc;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
