/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDocumentInFeed1683802969000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop view feed_items;

      create or replace view feed_items (id, created_at, entity_id, type) as 
      select note.id, note.created_at, note.entity_id, case when note.recipient_id is null then 'note'::text else 'chat'::text end as type
      from note
      union
        select task.id, task.created_at, task.entity_id, 'task'::text as type
        from task
      union
        select activity.id, activity.created_at, activity.entity_id, 'activity'::text as type
        from activity
      union
        (select max(message.id) as id, max(message.date) as created_at, message.entity_id as entity_id, 'mail'::text as type
        from mail_message message
        where message.entity_id is not null
        group by message.thread_id, message.entity_id
        order by (max(message.date)) desc)
      union
        (select max(message.id) as id, max(message.date) as created_at, el.source_id as entity_id, 'mail'::text as type
        from mail_message message
        right join entity_link el ON el.target_id = message.entity_id
        where message.entity_id is not null
        group by message.thread_id, el.source_id
        order by (max(message.date)) desc)
      union
        select fl.id, fl.created_at, fl.source_id, 'document'::text as type
        from file_link fl
        where fl.source_type = 'entity_document'
      order by created_at desc;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
