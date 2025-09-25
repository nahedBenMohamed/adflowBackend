/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatProviderCascadeDelete1709280253891 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table chat
        drop constraint chat_provider_id_fkey,
        add constraint chat_provider_id_fkey foreign key (provider_id) references chat_provider(id) on delete cascade;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
