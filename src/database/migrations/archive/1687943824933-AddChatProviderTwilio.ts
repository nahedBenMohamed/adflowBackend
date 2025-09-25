/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChatProviderTwilio1687943824933 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table chat_provider_twilio (
        provider_id integer not null,
        account_sid character varying not null,
        auth_token character varying not null,
        whatsapp_number character varying not null,
        account_id integer not null,
        primary key (provider_id),
        foreign key (provider_id) references chat_provider(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
