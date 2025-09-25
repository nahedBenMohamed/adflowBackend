/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class TurnOnChatFeature1676383947580 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        update feature
        set is_enabled = true
        where code = 'chat'
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
