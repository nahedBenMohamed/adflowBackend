/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAvatarId1679929245833 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table users
        drop column avatar_url,
        add column avatar_id uuid;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
