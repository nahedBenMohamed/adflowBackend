/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterChat1688136613049 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table chat
        drop constraint chat_created_by_fkey,
        alter column created_by drop not null,
        add constraint chat_created_by_fkey foreign key (created_by) references users(id) on delete set null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
