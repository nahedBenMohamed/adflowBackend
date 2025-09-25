/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterTask1735290249052 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from task where board_id is null;
      delete from task where stage_id is null;

      alter table task
        alter column stage_id set not null,
        alter column board_id set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
