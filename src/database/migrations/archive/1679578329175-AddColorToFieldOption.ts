/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColorToFieldOption1679578329175 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table field_option
            add column color varchar(50);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
