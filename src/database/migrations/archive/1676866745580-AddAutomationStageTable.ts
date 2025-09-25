/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAutomationStageTable1676866745580 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table automation_stage
        (
            automation_id integer,
            stage_id      integer,
            foreign key (automation_id) references automation (id) on delete cascade,
            foreign key (stage_id) references stage (id) on delete cascade,
            primary key (automation_id, stage_id)
        );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
