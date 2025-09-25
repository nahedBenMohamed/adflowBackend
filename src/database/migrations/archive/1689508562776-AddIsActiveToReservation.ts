/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToReservation1689508562776 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table reservation
            add column is_active boolean not null default true;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
