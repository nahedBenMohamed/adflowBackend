/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeFieldGroupOptional1679494426598 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table field
            alter column field_group_id drop not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
