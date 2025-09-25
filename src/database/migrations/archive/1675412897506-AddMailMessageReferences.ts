/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMailMessageReferences1675412897506 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mail_message
        add column references_to character varying,
        add column in_reply_to character varying;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
