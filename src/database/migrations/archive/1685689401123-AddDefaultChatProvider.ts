/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultChatProvider1685689401123 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      insert into chat_provider
      select 
        nextval('chat_provider_id_seq') as id,
        users.id as created_by,
        'amwork' as type,
        account.company_name || ' Chat' as title,
        account.id as account_id,
        account.created_at as created_at
      from account join users on users.account_id = account.id and users.role = 'owner';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
