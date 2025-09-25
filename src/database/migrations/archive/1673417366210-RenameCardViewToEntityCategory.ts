/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameCardViewToEntityCategory1673417366210 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table entity_type rename column card_view to entity_category;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
