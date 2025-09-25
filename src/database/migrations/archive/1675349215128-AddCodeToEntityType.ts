/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCodeColumn1675349215128 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table entity_type
            add code varchar(255);

        alter table entity_type
            add constraint entity_type__code__account_id__uniq
                unique (code, account_id);

        update entity_type
        set code = 'deal'
        where name = 'Deal';

        update entity_type
        set code = 'contact'
        where name = 'Contact';

        update entity_type
        set code = 'company'
        where name = 'Company';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
