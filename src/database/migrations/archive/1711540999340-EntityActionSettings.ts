/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EntityActionSettings1711540999340 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update entity_action_settings set operation_type = 'copy_original' where operation_type = 'copy';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
