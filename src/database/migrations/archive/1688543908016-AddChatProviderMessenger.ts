/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatProviderMessenger1688543908016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table chat_provider_messenger (
        provider_id integer,
        page_id character varying not null,
        page_access_token character varying not null,
        account_id integer not null,
        primary key (provider_id),
        foreign key (provider_id) references chat_provider(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );  
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
