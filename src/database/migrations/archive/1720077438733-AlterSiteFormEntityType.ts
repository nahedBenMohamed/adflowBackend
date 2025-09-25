/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterSiteFormEntityType1720077438733 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      alter table site_form_entity_type add column is_main boolean;

      with selected as (
        select distinct on (form_id) form_id, entity_type_id
        from site_form_entity_type
        order by form_id, entity_type_id
      )
      update site_form_entity_type
      set is_main = case when (form_id, entity_type_id) in (select form_id, entity_type_id from selected) then true else false end
      where form_id in (select form_id from selected);

      alter table site_form_entity_type alter column is_main set not null;
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
