/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFeedItemsSequence1668769413399 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      drop sequence note_id_seq;
      create sequence feed_item_id_seq as bigint minvalue 22022001;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
