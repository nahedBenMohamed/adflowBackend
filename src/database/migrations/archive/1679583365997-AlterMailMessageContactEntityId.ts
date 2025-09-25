/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterMailMessageContactEntityId1679583365997 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop view feed_items;

      alter table mail_message rename column contact_entity_id to entity_id;

      create or replace view feed_items (id, created_at, entity_id, type) as 
        SELECT note.id,
           note.created_at,
           note.entity_id,
           case when note.recipient_id is null then 'note'::text else 'chat'::text end as type
        FROM note
        UNION
        SELECT task.id,
            task.created_at,
            task.entity_id,
            'task'::text as type
          FROM task
        UNION
        SELECT activity.id,
            activity.created_at,
            activity.entity_id,
            'activity'::text as type
          FROM activity
        UNION
        (SELECT max(message.id) as id,
            max(message.date) as created_at,
            message.entity_id as entity_id,
            'mail'::text as type
          FROM mail_message message
          WHERE message.entity_id is not null
          GROUP BY message.thread_id, message.entity_id
          ORDER BY (max(message.date)) desc)
        UNION
        (SELECT max(message.id) as id,
            max(message.date) as created_at,
            el.source_id as entity_id,
            'mail'::text as type
          FROM mail_message message
            RIGHT JOIN entity_link el ON el.target_id = message.entity_id
          WHERE message.entity_id is not null
          GROUP BY message.thread_id, el.source_id
          ORDER BY (max(message.date)) desc)
      order by created_at desc;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
