/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class BoardIndexes1732628496619 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
DROP INDEX IF EXISTS stage_account_id_idx;
DROP INDEX IF EXISTS stage_board_id_idx;
DROP INDEX IF EXISTS stage_board_id_account_id_idx;
CREATE INDEX IF NOT EXISTS idx_board_stage_account_board_sort ON board_stage (account_id, board_id, sort_order);
ANALYZE board_stage;

DROP INDEX IF EXISTS board_account_id_idx;
DROP INDEX IF EXISTS board_type_idx;
DROP INDEX IF EXISTS board_record_id_idx;
CREATE INDEX IF NOT EXISTS idx_board_account_type_sort ON board (account_id, type, sort_order);
CREATE INDEX IF NOT EXISTS idx_board_account_record_sort ON board (account_id, record_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_board_account_id_sort ON board (account_id, id, sort_order);
ANALYZE board;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
