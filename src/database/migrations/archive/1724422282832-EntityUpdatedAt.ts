/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class EntityUpdatedAt1724422282832 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table entity add column updated_at timestamp without time zone;
      update entity set updated_at = created_at;
      alter table entity alter column updated_at set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
