/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatUser1688567846856 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table chat_user rename column external_name to external_first_name;
      alter table chat_user
        add column external_last_name character varying,
        add column external_avatar_url character varying;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
