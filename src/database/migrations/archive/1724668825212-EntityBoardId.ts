/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EntityBoardId1724668825212 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table entity
        add column board_id integer,
        add foreign key (board_id) references board(id) on delete cascade;
      
      update entity
        set board_id = (select board_id from stage where stage.id = entity.stage_id)
      where entity.stage_id is not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
