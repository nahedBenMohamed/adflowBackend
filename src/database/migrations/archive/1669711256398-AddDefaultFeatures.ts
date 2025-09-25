/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDefaultFeatures1669711256398 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      insert into feature(name, code, is_enabled) values('Activities', 'activities', true);
      insert into feature(name, code, is_enabled) values('Tasks', 'tasks', true);
      insert into feature(name, code, is_enabled) values('Comments', 'comments', false);
      insert into feature(name, code, is_enabled) values('Chat', 'chat', false);
      insert into feature(name, code, is_enabled) values('File storage', 'saveFiles', false);
      insert into feature(name, code, is_enabled) values('File storage disk', 'diskForFiles', false);
      insert into feature(name, code, is_enabled) values('Avatar', 'avatar', false);
      insert into feature(name, code, is_enabled) values('Photo/pictures (several)', 'photos', false);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
