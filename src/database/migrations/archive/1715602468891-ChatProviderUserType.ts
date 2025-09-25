/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ChatProviderUserType1715602468891 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter type chat_provider_user_type add value 'supervisor';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
