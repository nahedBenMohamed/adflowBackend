/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeFeatureNameNotes1669880194355 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update feature set name = 'Notes', code = 'notes', is_enabled = true where code = 'comments';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
