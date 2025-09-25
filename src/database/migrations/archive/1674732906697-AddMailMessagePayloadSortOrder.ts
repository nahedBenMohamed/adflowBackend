/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMailMessagePayloadSortOrder1674732906697 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mail_message_payload
        add column sort_order smallint not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
