/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedAtToFileLink1673514341599 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table file_link add column created_at timestamp without time zone;
      update file_link set created_at = file_info.created_at from file_info where file_link.file_id = file_info.id;
      alter table file_link alter column created_at set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
