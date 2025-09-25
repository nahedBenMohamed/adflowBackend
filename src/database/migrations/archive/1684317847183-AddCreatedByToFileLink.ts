/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class addCreatedByToFileLink1684317847183 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table file_link
        add column created_by integer,
        add foreign key (created_by) references users(id) on delete cascade;

      update file_link set created_by = file_info.created_by from file_info where file_info.id = file_link.file_id;

      alter table file_link alter column created_by set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
