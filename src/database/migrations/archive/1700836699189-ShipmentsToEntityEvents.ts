/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ShipmentsToEntityEvents1700836699189 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      insert into entity_event (account_id, entity_id, object_id, type, created_at)
        select
          s.account_id, 
          (select o.entity_id from orders o where o.id = s.order_id)::integer as entity_id, 
          s.id as object_id, 
          'shipment'::text as type,
          s.created_at
        from shipment s
        where exists (select 1 from orders o where o.id = s.order_id)    
      `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
