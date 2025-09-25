/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSchedulePerformerId1700060543771 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table schedule_performer
        drop constraint schedule_performer_pkey,
        add column id integer generated always as identity,
        add primary key (id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
