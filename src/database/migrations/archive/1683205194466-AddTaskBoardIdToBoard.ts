/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskBoardIdToBoard1683205194466 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table board
        add column task_board_id integer default null,
        add foreign key (task_board_id) references board(id) on delete set null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
