/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCodeToField1678720323399 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table field
            add code varchar(255);

        alter table field
            add constraint field__code__entity_type_id__uniq
                unique (code, entity_type_id);
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
