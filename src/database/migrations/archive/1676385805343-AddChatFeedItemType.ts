/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatFeedItemType1676385805343 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
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
            'task'::text AS type
          FROM task
        UNION
        SELECT activity.id,
            activity.created_at,
            activity.entity_id,
            'activity'::text AS type
          FROM activity
        UNION
        (SELECT max(message.id) AS id,
            max(message.date) AS created_at,
            el.source_id AS entity_id,
            'mail'::text AS type
          FROM mail_message message
            RIGHT JOIN entity_link el ON el.target_id = message.contact_entity_id
          WHERE message.contact_entity_id IS NOT NULL
          GROUP BY message.thread_id, el.source_id
          ORDER BY (max(message.date)) DESC)
      order by created_at desc;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
