/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskToFeed1669130700529 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create or replace view feed_items (id, created_at, entity_id, type) as 
        select id, created_at, entity_id, 'note' as type from note
        union
        select id, created_at, entity_id, 'task' as type from task
        union
        select id, created_at, entity_id, 'activity' as type from activity
      order by created_at desc;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
