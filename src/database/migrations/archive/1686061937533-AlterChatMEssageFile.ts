/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatMEssageFile1686061937533 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    alter table chat_message_file
      drop column file_link_id,
      add column file_id uuid,
      add column name character varying not null,
      add column mime_type character varying not null,
      add column size integer not null,
      add column created_at timestamp without time zone not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
