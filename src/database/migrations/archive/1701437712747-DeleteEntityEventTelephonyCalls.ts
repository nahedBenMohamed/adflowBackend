/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class DeleteEntityEventTelephonyCalls1701437712747 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from entity_event ee where ee.type='telephony-call';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
