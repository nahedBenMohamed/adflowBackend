/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class NoteFileRemoveFileKey1671196394406 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table note_file drop constraint note_file_file_info_id_fkey;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
