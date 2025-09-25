/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductsSectionEntityType1691139996885 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      create table products_section_entity_type (
        section_id integer,
        entity_type_id integer,
        account_id integer not null,
        primary key (section_id, entity_type_id),
        foreign key (section_id) references products_section(id) on delete cascade,
        foreign key (entity_type_id) references entity_type(id) on delete cascade,
        foreign key (account_id) references account(id) on delete cascade
      );

      insert into products_section_entity_type
        select ps.id as section_id, et.id as entity_type_id, ps.account_id as account_id
        from products_section ps
        inner join entity_type et on 1=1
        inner join entity_type_feature etf on et.id = etf.entity_type_id
        inner join feature f on f.id = etf.feature_id and f.code = 'products';

      update feature set is_enabled = false where code = 'products';
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
