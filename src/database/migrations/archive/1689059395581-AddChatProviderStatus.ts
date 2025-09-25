/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatProviderStatus1689059395581 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table chat_provider add column status character varying not null default 'draft';
      update chat_provider set status = 'active';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
