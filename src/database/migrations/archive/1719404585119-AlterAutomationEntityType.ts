/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAutomationEntityType1719404585119 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table automation_entity_type
        add column entity_type_id integer not null,
        add column board_id integer,
        add column stage_id integer,
        add foreign key (entity_type_id) references entity_type(id),
        add foreign key (board_id) references board(id),
        add foreign key (stage_id) references stage(id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
