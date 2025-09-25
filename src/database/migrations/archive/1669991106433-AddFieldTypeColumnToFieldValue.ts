/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldTypeColumnToFieldValue1669991106433 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table field_value
        add column field_type varchar(50);

        update field_value
        set (field_type) = (select type from field where field.id = field_value.field_id);

        alter table field_value
        alter column field_type set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
