/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AppSumoPresets1720423072348 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      insert into app_sumo_preset(tier, user_count, term_in_days) values(1, 1, 36500);
      insert into app_sumo_preset(tier, user_count, term_in_days) values(2, 5, 36500);
      insert into app_sumo_preset(tier, user_count, term_in_days) values(3, 15, 36500);
      insert into app_sumo_preset(tier, user_count, term_in_days) values(4, 30, 36500);
      insert into app_sumo_preset(tier, user_count, term_in_days) values(5, 50, 36500);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
