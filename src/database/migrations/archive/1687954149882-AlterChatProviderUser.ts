/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChatProviderUser1687954149882 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table chat_provider_user
        drop column id,
        add primary key (provider_id, user_id);
        
      drop sequence chat_provider_user_id_seq;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
