/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStageIdToTask1671006792499 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table task
        add column stage_id integer,
        add foreign key(stage_id) references stage(id);  
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
