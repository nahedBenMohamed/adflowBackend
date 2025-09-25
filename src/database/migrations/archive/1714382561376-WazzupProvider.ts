/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class WazzupProvider1714382561376 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table chat_provider_wazzup (
        provider_id integer,
        account_id integer not null,
        api_key character varying not null,
        channel_id character varying not null,
        chat_type character varying not null,
        plain_id character varying not null,
        primary key (provider_id),
        foreign key (provider_id) references chat_provider(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
