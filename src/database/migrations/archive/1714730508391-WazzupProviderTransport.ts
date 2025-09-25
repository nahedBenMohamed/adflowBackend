/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class WazzupProviderTransport1714730508391 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from chat_provider_wazzup;
      alter table chat_provider_wazzup add column transport character varying not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
