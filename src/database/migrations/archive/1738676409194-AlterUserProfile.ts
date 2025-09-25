/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterUserProfile1738676409194 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table user_profile add column working_time_from time without time zone;
      alter table user_profile add column working_time_to time without time zone;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
