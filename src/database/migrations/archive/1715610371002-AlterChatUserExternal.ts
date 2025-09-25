/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatUserExternal1715610371002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table chat_user_external
        add column chat_user_id integer,
        add foreign key (chat_user_id) references chat_user(id) on delete cascade;

      update chat_user_external
      set chat_user_id = (
          select id 
          from chat_user 
          where chat_user.external_user_id = chat_user_external.id
      );

      delete from chat_user_external where chat_user_id is null;

      alter table chat_user drop column external_user_id;

      alter table chat_user_external
        drop constraint chat_user_external_pkey,
        add primary key (chat_user_id);

      alter table chat_user_external drop column id;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
