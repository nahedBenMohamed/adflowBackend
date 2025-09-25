/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class TrimUsersNames1683875863921 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update users
      set first_name = trim (first_name),
          last_name = trim (last_name);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
