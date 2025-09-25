/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class IndexGoogleCalendar1735573056216 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create index if not exists idx_account_type_object on google_calendar(account_id,type,object_id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
