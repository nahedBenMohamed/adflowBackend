/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEntityLinkColumns1669799906268 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        alter table entity_link
        alter column source_id type bigint using source_id::bigint,
        alter column target_id type bigint using target_id::bigint
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
