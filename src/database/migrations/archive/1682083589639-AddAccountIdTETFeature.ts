/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountIdTETFeature1682083589639 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        alter table entity_type_feature
            add account_id integer,
            add foreign key (account_id) references account(id) on delete cascade;

        update entity_type_feature as etf
        set (account_id) = (select et.account_id from entity_type et where et.id = etf.entity_type_id);

        alter table entity_type_feature
            alter column account_id set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
