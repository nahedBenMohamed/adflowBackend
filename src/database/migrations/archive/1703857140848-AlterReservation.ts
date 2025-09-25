/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterReservation1703857140848 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from reservation where is_active = false;

      alter table reservation drop column is_active;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
