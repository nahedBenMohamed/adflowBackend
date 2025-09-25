/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EntityChangeHistoryInit1708433846254 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from entity_stage_history;

      insert into entity_stage_history (account_id, entity_id, board_id, stage_id, created_at)
      select 
        e.account_id as account_id, e.id as entity_id, s.board_id as board_id, e.stage_id as stage_id, e.created_at as created_at
      from entity e
      inner join stage s on s.id = e.stage_id
      where s.is_system = false;
      
      insert into entity_stage_history (account_id, entity_id, board_id, stage_id, created_at)
      select 
        e.account_id as account_id, e.id as entity_id, s.board_id as board_id, e.stage_id as stage_id, e.closed_at as created_at
      from entity e
      inner join stage s on s.id = e.stage_id
      where s.is_system = true;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
