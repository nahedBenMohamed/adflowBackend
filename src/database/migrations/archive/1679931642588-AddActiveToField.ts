/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActiveToField1679931642588 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table field
            add column active boolean default true not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
