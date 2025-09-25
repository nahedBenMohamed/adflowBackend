/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterBoardStage1728465792633 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table board_stage
        drop constraint stage_board_id_fkey,
        add constraint stage_board_id_fkey foreign key (board_id) references board(id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
