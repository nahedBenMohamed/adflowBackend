/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHistoryIdToGmailSettings1674492197867 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mailbox_settings_gmail
        add column history_id character varying;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
