/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveWazzupProviders1714732587962 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from chat_provider where type = 'wazzup';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
