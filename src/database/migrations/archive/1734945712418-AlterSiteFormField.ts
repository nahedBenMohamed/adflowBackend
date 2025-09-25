/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSiteFormField1734945712418 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
alter table site_form_field
  add column entity_type_id integer,
  add column field_id integer,
  add column is_validation_required boolean,
  add column meta jsonb,
  add foreign key (entity_type_id) references entity_type(id) on delete cascade,
  add foreign key (field_id) references field(id) on delete cascade;

update site_form_field
set entity_type_id = (select sffen.entity_type_id from site_form_field_entity_name sffen where sffen.form_field_id = site_form_field.id)
where site_form_field.type = 'entity_name';

update site_form_field
set (entity_type_id, field_id, is_validation_required, meta) = 
	(select sffef.entity_type_id, sffef.field_id, sffef.is_validation_required, sffef.meta from site_form_field_entity_field sffef where sffef.form_field_id = site_form_field.id)
where site_form_field.type = 'entity_field';

drop table site_form_field_entity_name;
drop table site_form_field_entity_field;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
