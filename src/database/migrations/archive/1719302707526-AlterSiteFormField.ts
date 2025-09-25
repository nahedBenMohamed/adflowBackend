/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSiteFormField1719302707526 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      delete from site_form_field;

      alter table site_form_field
        drop column object_id,
        drop column meta,
        drop column is_validation_required;

      create table site_form_field_entity_name (
        form_field_id integer,
        entity_type_id integer not null,
        primary key (form_field_id),
        foreign key (form_field_id) references site_form_field(id) on delete cascade,
        foreign key (entity_type_id) references entity_type(id) on delete cascade
      );

      create table site_form_field_entity_field (
        form_field_id integer,
        field_id integer not null,
        entity_type_id integer not null,
        is_validation_required boolean,
        meta jsonb,
        primary key (form_field_id),
        foreign key (form_field_id) references site_form_field(id) on delete cascade,
        foreign key (field_id) references field(id) on delete cascade,
        foreign key (entity_type_id) references entity_type(id) on delete cascade
      );
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
