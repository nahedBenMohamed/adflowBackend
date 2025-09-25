/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMailMessageMessageId1675259924922 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mail_message add column message_id character varying;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
