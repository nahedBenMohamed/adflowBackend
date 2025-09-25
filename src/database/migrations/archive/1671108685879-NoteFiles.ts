/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class NoteFiles1671108685879 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table note_file (
        note_id integer NOT NULL,
        file_info_id uuid NOT NULL,
        primary key (note_id, file_info_id),
        foreign key (note_id) references note(id),
        foreign key (file_info_id) references file_info(id)
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
