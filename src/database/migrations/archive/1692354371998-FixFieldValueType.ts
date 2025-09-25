/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class FixFieldValueType1692354371998 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      update field_value set field_type = (select type from field where field.id = field_value.field_id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
