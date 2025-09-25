/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AllEventsMigrationScript1700475817946 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from entity_event;
      insert into entity_event (account_id, entity_id, object_id, type, created_at)
        select
          n.account_id, 
          n.entity_id, 
          n.id as object_id, 
          'note'::text as type,
          n.created_at
        from note n
        where n.entity_id is not null
        union
          select 
            t.account_id,
            t.entity_id, 
            t.id as object_id, 
            'task'::text as type,
            t.created_at 
          from task t
          where t.entity_id is not null
        union
          select
            a.account_id, 
            a.entity_id, 
            a.id as object_id, 
            'activity'::text as type,
            a.created_at 
          from activity a
          where a.entity_id is not null
        union
          select
            m.account_id, 
            m.entity_id, 
            max(m.id) as object_id, 
            'mail'::text as type,
            max(m.date) as created_at 
          from mail_message m
          where m.entity_id is not null
          group by m.account_id, m.thread_id, m.entity_id
        union
          select
            f.account_id, 
            f.source_id as entity_id, 
            f.id as object_id, 
            'document'::text as type,
            f.created_at
          from file_link f
          where f.source_type = 'entity_document'
          and f.source_id is not null
          and exists (select 1 from entity e where e.id = f.source_id)
        order by created_at desc;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
