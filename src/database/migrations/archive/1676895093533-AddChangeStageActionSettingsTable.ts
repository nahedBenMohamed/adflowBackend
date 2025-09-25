/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddChangeStageActionSettingsTable1676895093533 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        create table change_stage_action_settings
        (
            action_id  integer,
            stage_id   integer not null,
            account_id integer not null,
            primary key (action_id),
            foreign key (action_id) references action (id) on delete cascade,
            foreign key (stage_id) references stage (id) on delete cascade,
            foreign key (account_id) references account (id) on delete cascade
        );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
