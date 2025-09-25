/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailsPerDayColumnToMailbox1681732037710 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table mailbox
            add column emails_per_day smallint default null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
