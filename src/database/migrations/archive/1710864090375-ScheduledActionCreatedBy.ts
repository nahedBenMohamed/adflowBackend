/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ScheduledActionCreatedBy1710864090375 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table scheduled_action
        add column created_by integer,
        add foreign key (created_by) references users(id);
      
      update scheduled_action
        set created_by = (select created_by from automation where automation.action_id = scheduled_action.action_id);

      alter table scheduled_action alter column created_by set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
