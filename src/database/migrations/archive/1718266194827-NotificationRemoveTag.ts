/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationRemoveTag1718266194827 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table notification drop column tag_name;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
