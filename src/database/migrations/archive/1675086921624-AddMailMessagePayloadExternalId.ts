/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMailMessagePayloadExternalId1675086921624 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table mail_message_payload
        add column external_id character varying;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
